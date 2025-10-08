// /api/clubs/[id]/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { AttendanceEmail } from '@/emails/AttendanceEmail';

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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date'); // For fetching specific date

    let where: any = { clubId };

    if (date) {
      // Parse the date and normalize to start of day in GMT
      const sessionDate = new Date(date);
      const year = sessionDate.getFullYear();
      const month = sessionDate.getMonth();
      const day = sessionDate.getDate();
      
      // Create a date at midnight GMT for the selected date
      const gmtDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      where.date = gmtDate;
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const sessions = await prisma.activitySession.findMany({
      where,
      include: {
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                studentCode: true,
                className: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Ирц татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        { error: 'Зөвхөн админ ирц бүртгэх боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { records, date, description } = body;

    // Parse the date and normalize to start of day in GMT
    const sessionDate = new Date(date);
    const year = sessionDate.getFullYear();
    const month = sessionDate.getMonth();
    const day = sessionDate.getDate();
    
    // Create a date at midnight GMT for the selected date
    const gmtDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    
    // Get current date (normalized to start of day)
    const now = new Date();
    const today = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    
    // Check if the selected date is in the past (before today)
    if (gmtDate.getTime() < today.getTime()) {
      return NextResponse.json(
        { error: 'Өнгөрсөн өдрийн ирцийг засах боломжгүй' },
        { status: 400 }
      );
    }
    
    // Check if the selected date is today - allow editing
    const isToday = gmtDate.getTime() === today.getTime();
    
    if (isToday) {
      // For today's date, we can create or update the session
      // Create or update activity session
      const activitySession = await prisma.activitySession.upsert({
        where: {
          clubId_date: {
            clubId,
            date: gmtDate,
          },
        },
        update: {
          description,
        },
        create: {
          clubId,
          date: gmtDate,
          description,
        },
      });

      // Create or update attendance records
      const attendancePromises = records.map(async (record: any) => {
        const attendance = await prisma.activityAttendance.upsert({
          where: {
            sessionId_userId: {
              sessionId: activitySession.id,
              userId: record.userId,
            },
          },
          update: {
            status: record.status,
            notes: record.notes,
          },
          create: {
            sessionId: activitySession.id,
            userId: record.userId,
            status: record.status,
            notes: record.notes,
          },
          include: {
            user: true,
            activitySession: {
              include: {
                club: true,
              },
            },
          },
        });

        // Notify user
        await createNotification({
          userId: record.userId,
          type: 'ATTENDANCE_RECORDED',
          title: 'Ирц бүртгэгдлээ',
          message: `Таны ирц "${attendance.activitySession.club.title}" клубт бүртгэгдлээ`,
          data: { attendanceId: attendance.id, status: record.status },
        });

        if (attendance.user?.email) {
          await sendEmail({
            to: attendance.user.email,
            subject: 'Ирц бүртгэгдлээ',
            react: AttendanceEmail({
              clubTitle: attendance.activitySession.club.title,
              status: record.status,
              date: gmtDate.toISOString(),
            }),
          });
        }

        return attendance;
      });

      const createdRecords = await Promise.all(attendancePromises);

      return NextResponse.json(
        { session: activitySession, attendances: createdRecords },
        { status: 201 }
      );
    } else {
      // For future dates, don't allow creating attendance
      return NextResponse.json(
        { error: 'Зөвхөн өнөөдрийн ирцийг бүртгэх боломжтой' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json(
      { error: 'Ирц бүртгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}