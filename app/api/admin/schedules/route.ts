// app/api/admin/schedules/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвшөөрөл хүрэлцэхгүй байна' },
        { status: 403 }
      );
    }

    const schedules = await prisma.clubSchedule.findMany({
      include: {
        club: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
            isConfirmed: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Хуваарь татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}