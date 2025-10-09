// app/api/clubs/[id]/join-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const joinForm = await prisma.joinForm.findUnique({
      where: { clubId: clubId },
    });

    if (!joinForm) {
      return NextResponse.json(
        { error: 'Маягт олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json(joinForm);
  } catch (error) {
    console.error('Get join form error:', error);
    return NextResponse.json(
      { error: 'Маягт татахад алдаа гарлаа' },
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

    if (!member?.isAdmin && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ маягт засах боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fields } = body;

    const joinForm = await prisma.joinForm.upsert({
      where: { clubId: clubId },
      update: { fields },
      create: {
        clubId: clubId,
        fields,
      },
    });

    return NextResponse.json(joinForm);
  } catch (error) {
    console.error('Save join form error:', error);
    return NextResponse.json(
      { error: 'Маягт хадгалахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}