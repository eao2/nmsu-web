// /api/clubs/[id]/attendance/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: clubId, sessionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    // Check if user is admin
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
        { error: 'Зөвхөн админ устгах боломжтой' },
        { status: 403 }
      );
    }

    // Get the session to check its date
    const activitySession = await prisma.activitySession.findUnique({
      where: { id: sessionId },
    });

    if (!activitySession) {
      return NextResponse.json(
        { error: 'Ирц олдсонгүй' },
        { status: 404 }
      );
    }

    // Check if the session date is today
    const sessionDate = new Date(activitySession.date);
    const today = new Date();
    
    // Normalize dates to compare only year, month, and day
    sessionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() !== today.getTime()) {
      return NextResponse.json(
        { error: 'Зөвхөн өнөөдрийн ирцийг устгах боломжтой' },
        { status: 403 }
      );
    }

    // Delete the session (cascade will delete attendances)
    await prisma.activitySession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete attendance session error:', error);
    return NextResponse.json(
      { error: 'Ирц устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}