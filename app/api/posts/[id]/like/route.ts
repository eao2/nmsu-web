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

    if (existingLike) {
      if (isLike === existingLike.isLike) {
        await prisma.postLike.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({ removed: true });
      } else {
        const updated = await prisma.postLike.update({
          where: { id: existingLike.id },
          data: { isLike },
        });
        return NextResponse.json(updated);
      }
    } else {
      const like = await prisma.postLike.create({
        data: {
          postId: postId,
          userId: session.user.id,
          isLike,
        },
      });
      return NextResponse.json(like);
    }
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Лайк дарахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
