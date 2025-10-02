import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let where: any = {
      isActive: true,
      isConfirmed: true,
    };

    if (filter === 'my' && session?.user) {
      where = {
        isActive: true,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      };
    }

    const clubs = await prisma.club.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
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
      { error: 'Клубуудыг татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, profileImage, coverImage, isPublic } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Гарчиг болон тайлбар шаардлагатай' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const existingClub = await prisma.club.findUnique({
      where: { slug },
    });

    if (existingClub) {
      return NextResponse.json(
        { error: 'Ийм нэртэй клуб аль хэдийн байна' },
        { status: 400 }
      );
    }

    const club = await prisma.club.create({
      data: {
        title,
        slug,
        description,
        profileImage,
        coverImage,
        isPublic: isPublic ?? true,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            isAdmin: true,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        members: true,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'CLUB_ADMIN' },
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error('Create club error:', error);
    return NextResponse.json(
      { error: 'Клуб үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
