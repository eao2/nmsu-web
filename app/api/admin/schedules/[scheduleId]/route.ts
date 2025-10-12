// app/api/admin/schedules/[scheduleId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ засах боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, room, clubId } = body;

    if (!clubId) {
        return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
    }

    const conflict = await prisma.clubSchedule.findFirst({
      where: {
        room,
        dayOfWeek,
        startTime,
        id: { not: scheduleId },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'Энэ өрөө, өдөр, цагт аль хэдийн хуваарь байна' },
        { status: 400 }
      );
    }

    const schedule = await prisma.clubSchedule.update({
      where: { id: scheduleId },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        room,
        clubId,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Хуваарь засахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ устгах боломжтой' },
        { status: 403 }
      );
    }

    await prisma.clubSchedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Хуваарь устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}