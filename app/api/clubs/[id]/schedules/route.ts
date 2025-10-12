// app/api/clubs/[id]/schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;

    const schedules = await prisma.clubSchedule.findMany({
      where: { clubId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Get club schedules error:', error);
    return NextResponse.json(
      { error: 'Хуваарь татахад алдаа гарлаа' },
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

    // Check if user is admin of the club
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
        { error: 'Зөвхөн админ нэмэх боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, room } = body;

    // Check for conflicts
    const conflict = await prisma.clubSchedule.findFirst({
      where: {
        room,
        dayOfWeek,
        startTime,
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'Энэ өрөө, өдөр, цагт аль хэдийн хуваарь байна' },
        { status: 400 }
      );
    }

    const schedule = await prisma.clubSchedule.create({
      data: {
        clubId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Хуваарь үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}