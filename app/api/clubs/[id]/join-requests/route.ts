// app/api/clubs/[id]/join-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { JoinRequestEmail } from '@/emails/JoinRequestEmail';
import { JoinApprovedEmail } from '@/emails/JoinApprovedEmail';
import { confirmUploadedFiles } from '@/lib/confirmUploadedFiles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: clubId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: clubId,
          userId: session.user.id,
        },
      },
    });

    if (!member?.isAdmin && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ харах боломжтой' },
        { status: 403 }
      );
    }

    const requests = await prisma.joinRequest.findMany({
      where: { clubId: clubId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            phone: true,
            className: true,
            studentCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get join requests error:', error);
    return NextResponse.json(
      { error: 'Хүсэлтүүд татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: clubId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          where: { isAdmin: true },
          include: { user: true },
        },
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Клуб олдсонгүй' },
        { status: 404 }
      );
    }

    if (!club.allowJoinRequests) {
      return NextResponse.json(
        { error: 'Клуб одоогоор элсэлт хүлээн авахгүй байна' },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        clubId: clubId,
        userId: session.user.id,
        status: "PENDING"
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Та аль хэдийн хүсэлт илгээсэн байна' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answers } = body;

    const joinRequest = await prisma.joinRequest.create({
      data: {
        clubId: clubId,
        userId: session.user.id,
        answers,
      },
    });

    const fileKeysToConfirm = Object.values(answers).reduce((acc: string[], answer: any) => {
      if (typeof answer.value === 'string' && answer.value.startsWith('join-requests')) {
        acc.push(answer.value);
      }
      return acc;
    }, []);

    if (fileKeysToConfirm.length > 0) {
      await confirmUploadedFiles(fileKeysToConfirm);
    }

    // Notify all admins
    for (const admin of club.members) {
      await createNotification({
        userId: admin.userId,
        type: 'JOIN_REQUEST',
        title: 'Шинэ элсэлтийн хүсэлт',
        message: `${session.user.name} таны клубт элсэх хүсэлт илгээлээ`,
        data: { joinRequestId: joinRequest.id, clubId: clubId },
      });

      await sendEmail({
        to: admin.user.email,
        subject: 'Шинэ элсэлтийн хүсэлт',
        react: JoinRequestEmail({
          clubTitle: club.title,
          userName: session.user.name || 'Хэрэглэгч',
        }),
      });

      await sendPushNotification({
        userId: admin.userId,
        title: 'Шинэ элсэлтийн хүсэлт',
        body: `${session.user.name} таны клубт элсэх хүсэлт илгээлээ`,
        url: `/clubs/${club.slug}`,
      });
    }

    return NextResponse.json(joinRequest, { status: 201 });
  } catch (error) {
    console.error('Create join request error:', error);
    return NextResponse.json(
      { error: 'Хүсэлт илгээхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}