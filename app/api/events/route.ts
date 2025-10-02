import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.globalEvent.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Эвент татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ эвент үүсгэх боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, image, startDate, endDate } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Шаардлагатай талбарууд дутуу байна' },
        { status: 400 }
      );
    }

    const event = await prisma.globalEvent.create({
      data: {
        title,
        description,
        image,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Эвент үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}