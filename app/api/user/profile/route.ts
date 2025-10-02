import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, className, studentCode, profileComplete } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        className,
        studentCode,
        profileComplete,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Профайл шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}