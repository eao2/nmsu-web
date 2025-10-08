// src/app/api/clubs/[id]/leave-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { LeaveRequestEmail } from '@/emails/LeaveRequestEmail';

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
          clubId,
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

    const requests = await prisma.leaveRequest.findMany({
      where: { clubId },
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
    console.error('Get leave requests error:', error);
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

    // Check if user is a member
    const isMember = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: session.user.id,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: 'Та энэ клубын гишүүн биш байна' },
        { status: 400 }
      );
    }

    if (isMember.isAdmin) {
      return NextResponse.json(
        { error: 'Та энэ клубын админ гарах боломжгүй' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        clubId,
        userId: session.user.id,
        reason,
      },
    });

    // Notify all admins
    for (const admin of club.members) {
      await createNotification({
        userId: admin.userId,
        type: 'LEAVE_REQUEST',
        title: 'Гарах хүсэлт',
        message: `${session.user.name} клубээс гарах хүсэлт илгээлээ`,
        data: { leaveRequestId: leaveRequest.id, clubId },
      });

      await sendEmail({
        to: admin.user.email,
        subject: 'Гарах хүсэлт',
        react: LeaveRequestEmail({
          clubTitle: club.title,
          userName: session.user.name || 'Хэрэглэгч',
          reason: reason || 'Шалтгаан заагаагүй',
        }),
      });

      await sendPushNotification({
        userId: admin.userId,
        title: 'Гарах хүсэлт',
        body: `${session.user.name} клубээс гарах хүсэлт илгээлээ`,
        url: `/clubs/${club.slug}/leave-requests`,
      });
    }

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json(
      { error: 'Хүсэлт илгээхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}