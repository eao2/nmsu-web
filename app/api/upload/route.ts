// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleFileUpload } from '@/lib/upload';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '1024mb',
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'general';

    const result = await handleFileUpload(request, folder);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    await prisma.temporaryFile.create({
      data: {
        filePath: result.path!,
        fileName: result.filename!,
        fileType: result.fileType!,
        fileSize: result.fileSize!,
        uploadedBy: session.user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Файл хуулахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}