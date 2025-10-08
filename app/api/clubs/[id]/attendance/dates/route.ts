// /api/clubs/[id]/attendance/dates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clubId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    // Get all attendance sessions for this club with attendance count
    const sessions = await prisma.activitySession.findMany({
      where: { clubId },
      include: {
        attendances: {
          select: { id: true }
        }
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Format the response to include date and attendance count
    const attendanceDates = sessions.map(session => ({
      id: session.id,
      date: session.date,
      description: session.description,
      attendanceCount: session.attendances?.length || 0
    }));

    return NextResponse.json(attendanceDates);
  } catch (error) {
    console.error('Get attendance dates error:', error);
    return NextResponse.json(
      { error: 'Ирцийн огноог татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}