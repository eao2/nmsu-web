import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { LeaveApprovedEmail } from '@/emails/LeaveApprovedEmail';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        club: true,
        user: true,
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Хүсэлт олдсонгүй' },
        { status: 404 }
      );
    }

    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: leaveRequest.clubId,
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
        prisma.leaveRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        }),
        prisma.clubMember.delete({
          where: {
            clubId_userId: {
              clubId: leaveRequest.clubId,
              userId: leaveRequest.userId,
            },
          },
        }),
      ]);

      await createNotification({
        userId: leaveRequest.userId,
        type: 'LEAVE_APPROVED',
        title: 'Гарах хүсэлт зөвшөөрөгдлөө',
        message: `Таны "${leaveRequest.club.title}" клубаас гарах хүсэлт зөвшөөрөгдлөө`,
        data: { clubId: leaveRequest.clubId },
      });

      await sendEmail({
        to: leaveRequest.user.email,
        subject: 'Гарах хүсэлт зөвшөөрөгдлөө',
        react: LeaveApprovedEmail({ clubTitle: leaveRequest.club.title }),
      });

      await sendPushNotification({
        userId: leaveRequest.userId,
        title: 'Гарах хүсэлт зөвшөөрөгдлөө',
        body: `Таны "${leaveRequest.club.title}" клубаас гарах хүсэлт зөвшөөрөгдлөө`,
        url: `/clubs`,
      });
    } else if (action === 'reject') {
      await prisma.leaveRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });

      await createNotification({
        userId: leaveRequest.userId,
        type: 'LEAVE_REJECTED',
        title: 'Гарах хүсэлт татгалзагдлаа',
        message: `Таны "${leaveRequest.club.title}" клубаас гарах хүсэлт татгалзагдлаа`,
        data: { clubId: leaveRequest.clubId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update leave request error:', error);
    return NextResponse.json(
      { error: 'Шийдвэр гаргахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}