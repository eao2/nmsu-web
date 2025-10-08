import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/socket';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { NewPostEmail } from '@/emails/NewPostEmail';
import { confirmUploadedFiles } from '@/lib/confirmUploadedFiles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const posts = await prisma.post.findMany({
      where: { clubId: clubId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
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
            createdAt: 'desc',
          },
        },
        likes: true,
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
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Нийтлэл татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          clubId: clubId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Та энэ клубын гишүүн биш байна' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, attachments } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Агуулга шаардлагатай' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        clubId: clubId,
        authorId: session.user.id,
        content,
        attachments: attachments || [],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        club: {
          include: {
            members: {
              where: {
                userId: {
                  not: session.user.id,
                },
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    confirmUploadedFiles(attachments || []);

    // Notify all club members
    for (const member of post.club.members) {
      await createNotification({
        userId: member.userId,
        type: 'NEW_POST',
        title: 'Шинэ нийтлэл',
        message: `${post.author.name} шинэ нийтлэл нэмлээ`,
        data: { postId: post.id, clubId: clubId },
      });

      await sendEmail({
        to: member.user.email,
        subject: 'Шинэ нийтлэл',
        react: NewPostEmail({
          clubTitle: post.club.title,
          authorName: post.author.name || 'Хэрэглэгч',
          content: post.content.substring(0, 100),
        }),
      });

      await sendPushNotification({
        userId: member.userId,
        title: 'Шинэ нийтлэл',
        body: `${post.author.name} шинэ нийтлэл нэмлээ`,
        url: `/clubs/${post.club.slug}`,
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Нийтлэл үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}