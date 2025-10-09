// app/api/clubs/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { ClubApprovedEmail } from '@/emails/ClubApprovedEmail';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: clubId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ баталгаажуулах боломжтой' },
        { status: 403 }
      );
    }

    const club = await prisma.club.update({
      where: { id: clubId },
      data: { isConfirmed: true },
      include: {
        creator: true,
      },
    });

    await createNotification({
      userId: club.creatorId,
      type: 'CLUB_APPROVED',
      title: 'Клуб баталгаажлаа',
      message: `Таны "${club.title}" клуб баталгаажлаа`,
      data: { clubId: club.id },
    });

    await sendEmail({
      to: club.creator.email,
      subject: 'Клуб баталгаажлаа',
      react: ClubApprovedEmail({ clubTitle: club.title }),
    });

    await sendPushNotification({
      userId: club.creatorId,
      title: 'Клуб баталгаажлаа',
      body: `Таны "${club.title}" клуб баталгаажлаа`,
      url: `/clubs/${club.slug}`,
    });

    return NextResponse.json(club);
  } catch (error) {
    console.error('Approve club error:', error);
    return NextResponse.json(
      { error: 'Клуб баталгаажуулахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}