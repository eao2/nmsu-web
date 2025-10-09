// app/api/join-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { JoinApprovedEmail } from '@/emails/JoinApprovedEmail';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: id },
      include: {
        club: true,
        user: true,
      },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Хүсэлт олдсонгүй' },
        { status: 404 }
      );
    }

    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: joinRequest.clubId,
          userId: session.user.id,
        },
      },
    });

    if (!member?.isAdmin && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ шийдвэр гаргах боломжтой' },
        { status: 403 }
      );
    }

    if (action === 'approve') {
      await prisma.$transaction([
        prisma.joinRequest.update({
          where: { id: id },
          data: { status: 'APPROVED' },
        }),
        prisma.clubMember.create({
          data: {
            clubId: joinRequest.clubId,
            userId: joinRequest.userId,
          },
        }),
      ]);

      await createNotification({
        userId: joinRequest.userId,
        type: 'JOIN_APPROVED',
        title: 'Элсэлт зөвшөөрөгдлөө',
        message: `Таны "${joinRequest.club.title}" клубт элсэх хүсэлт зөвшөөрөгдлөө`,
        data: { clubId: joinRequest.clubId },
      });

      await sendEmail({
        to: joinRequest.user.email,
        subject: 'Элсэлт зөвшөөрөгдлөө',
        react: JoinApprovedEmail({ clubTitle: joinRequest.club.title }),
      });

      await sendPushNotification({
        userId: joinRequest.userId,
        title: 'Элсэлт зөвшөөрөгдлөө',
        body: `Таны "${joinRequest.club.title}" клубт элсэх хүсэлт зөвшөөрөгдлөө`,
        url: `/clubs/${joinRequest.club.slug}`,
      });
    } else if (action === 'reject') {
      await prisma.joinRequest.update({
        where: { id: id },
        data: { status: 'REJECTED' },
      });

      await createNotification({
        userId: joinRequest.userId,
        type: 'JOIN_REJECTED',
        title: 'Элсэлт татгалзагдлаа',
        message: `Таны "${joinRequest.club.title}" клубт элсэх хүсэлт татгалзагдлаа`,
        data: { clubId: joinRequest.clubId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update join request error:', error);
    return NextResponse.json(
      { error: 'Шийдвэр гаргахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}