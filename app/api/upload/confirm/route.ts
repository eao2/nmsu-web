// app/api/upload/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Нэвтрэх шаардлагатай' },
    //     { status: 401 }
    //   );
    // }

    // const body = await request.json();
    // const { filePaths } = body;

    // // Remove from temporary files
    // await prisma.temporaryFile.deleteMany({
    //   where: {
    //     filePath: { in: filePaths },
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Confirm upload error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}