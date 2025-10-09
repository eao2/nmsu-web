// app/api/admin/clubs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвшөөрөл хүрэлцэхгүй байна' },
        { status: 403 }
      );
    }

    const clubs = await prisma.club.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Get clubs error:', error);
    return NextResponse.json(
      { error: 'Клубууд татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}