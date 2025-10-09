// app/api/clubs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { confirmUploadedFiles } from '@/lib/confirmUploadedFiles';

// Define types for better type safety
type ClubMember = {
  id: string;
  isAdmin: boolean;
  userId: string;
  clubId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type Club = {
  id: string;
  title: string;
  slug: string;
  description: string;
  profileImage: string | null;
  coverImage: string | null;
  isPublic: boolean;
  isActive: boolean;
  isConfirmed: boolean;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  members: ClubMember[];
  _count: {
    members: number;
    posts: number;
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      try {
        const club = await prisma.club.findUnique({
          where: { slug: slug },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                    phone: true,
                    className: true,
                    studentCode: true,
                  },
                },
              },
            },
            posts: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    likes: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 10,
            },
            _count: {
              select: {
                members: true,
                posts: true,
              },
            },
          },
        });

        if (!club) {
          return NextResponse.json(
            { error: 'Клуб олдсонгүй' },
            { status: 404 }
          );
        }

        return NextResponse.json(club);
      } catch (error) {
        console.error('Get club error:', error);
        return NextResponse.json(
          { error: 'Клубын мэдээлэл татахад алдаа гарлаа' },
          { status: 500 }
        );
      }
    }

    // Get user's clubs
    let myClubs: Array<Club> = [];
    if (session?.user) {
      myClubs = await prisma.club.findMany({
        where: {
          members: {
            some: {
              userId: session.user.id,
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
    }

    // Get all other clubs (excluding user's clubs)
    const myClubIds = myClubs.map(club => club.id);
    const otherClubs: Array<Club> = await prisma.club.findMany({
      where: {
        isActive: true,
        isConfirmed: true,
        id: {
          notIn: myClubIds,
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

    return NextResponse.json({
      myClubs,
      otherClubs,
    });
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
    
    confirmUploadedFiles([profileImage, coverImage]);

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