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
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = { clubId: clubId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
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
            activitySession: false, // avoid recursion, no need to include itself
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (err) {
    console.error('Get attendance error:', err);
    return NextResponse.json({ error: 'Ирц татахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clubId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    const body = await request.json();
    const { records, date, description } = body;

    // create session
    const activitySession = await prisma.activitySession.create({
      data: {
        clubId: clubId,
        date: new Date(date),
        description: description || '',
        attendances: {
          create: records.map((r: any) => ({
            userId: r.userId,
            status: r.status,
            notes: r.notes,
          })),
        },
      },
      include: {
        attendances: { include: { user: true } },
        club: true,
      },
    });

    // send notifications + emails
    await Promise.all(
      activitySession.attendances.map(async (att) => {
        await createNotification({
          userId: att.userId,
          type: 'ATTENDANCE_RECORDED',
          title: 'Ирц бүртгэгдлээ',
          message: `Таны ирц "${activitySession.club.title}" клубт бүртгэгдлээ`,
          data: { sessionId: activitySession.id, status: att.status },
        });

        if (att.user?.email) {
          await sendEmail({
            to: att.user.email,
            subject: 'Ирц бүртгэгдлээ',
            react: AttendanceEmail({
              clubTitle: activitySession.club.title,
              status: att.status,
              date: activitySession.date,
            }),
          });
        }
      })
    );

    return NextResponse.json(activitySession, { status: 201 });
  } catch (err) {
    console.error('Create attendance error:', err);
    return NextResponse.json({ error: 'Ирц бүртгэхэд алдаа гарлаа' }, { status: 500 });
  }
}
