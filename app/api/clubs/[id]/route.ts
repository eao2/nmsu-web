// app/api/clubs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { confirmUploadedFiles } from '@/lib/confirmUploadedFiles';
import { deleteFilesByKey } from '@/lib/minio-uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const club = await prisma.club.findUnique({
      where: { id },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const {id: clubId} = await params;

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
          clubId: clubId,
          userId: session.user.id,
        },
      },
    });

    if (!member?.isAdmin && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ засах боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const profileImage = body.profileImage || null;
    const coverImage = body.coverImage || null;

    confirmUploadedFiles([profileImage ,coverImage]);

    const prevClub = await prisma.club.findUnique({
      where: { id: clubId },
    });

    prevClub?.profileImage &&
      prevClub.profileImage !== profileImage &&
      (await deleteFilesByKey([prevClub.profileImage]));

    prevClub?.coverImage &&
      prevClub.coverImage !== coverImage &&
      (await deleteFilesByKey([prevClub.coverImage]));

    const club = await prisma.club.update({
      where: { id: clubId },
      data: body,
    });

    return NextResponse.json(club);
  } catch (error) {
    console.error('Update club error:', error);
    return NextResponse.json(
      { error: 'Клуб засахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const {id: clubId} = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Клуб олдсонгүй' },
        { status: 404 }
      );
    }

    
    if (club.isActive) {
      return NextResponse.json(
        { error: 'Идэвхитэй клуб байна' },
        { status: 403 }
      );
    }

    if (club.creatorId !== session.user.id && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн үүсгэгч устгах боломжтой' },
        { status: 403 }
      );
    }

    await prisma.club.delete({
      where: { id: clubId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete club error:', error);
    return NextResponse.json(
      { error: 'Клуб устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}