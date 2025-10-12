// app/api/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Сэтгэгдэл татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

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
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Агуулга шаардлагатай' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        authorId: session.user.id,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          include: {
            author: true,
          },
        },
      },
    });


    
    // Notify post author
    if (comment.post.authorId !== session.user.id) {
      await createNotification({
        userId: comment.post.authorId,
        type: 'NEW_COMMENT',
        title: 'Шинэ сэтгэгдэл',
        message: `${comment.author.name} таны нийтлэлд сэтгэгдэл үлдээлээ`,
        data: { commentId: comment.id, postId: postId },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Сэтгэгдэл үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}