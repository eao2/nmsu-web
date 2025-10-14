// app/api/posts/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isLike } = body;

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id,
        },
      },
    });

    let newLikeStatus = isLike;

    if (existingLike) {
      if (isLike === existingLike.isLike) {
        await prisma.postLike.delete({
          where: { id: existingLike.id },
        });
        newLikeStatus = false;
      } else {
        const updated = await prisma.postLike.update({
          where: { id: existingLike.id },
          data: { isLike },
        });
        newLikeStatus = updated.isLike;
      }
    } else {
      await prisma.postLike.create({
        data: {
          postId: postId,
          userId: session.user.id,
          isLike,
        }}
      );
    }

    const likeCount = await prisma.postLike.count({
      where: {
        postId: postId,
        isLike: true,
      },
    });

    return NextResponse.json({ 
      hasLiked: newLikeStatus,
      likeCount: likeCount
    });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Лайк дарахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}