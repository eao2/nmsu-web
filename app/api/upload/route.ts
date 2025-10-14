// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleFileUpload } from '@/lib/minio-uploads';
import { prisma } from '@/lib/prisma';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';

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

    let processedRequest = request;

    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (file && isHeicFile(file.name, file.type)) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const jpegBuffer = await convertHeicToJpeg(buffer);
          
          const jpegFile = new File([new Uint8Array(jpegBuffer)], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
          });
          
          const newFormData = new FormData();
          for (const [key, value] of formData.entries()) {
            if (key === 'file') {
              newFormData.append(key, jpegFile);
            } else {
              newFormData.append(key, value);
            }
          }
          
          processedRequest = new NextRequest(request.url, {
            method: 'POST',
            headers: request.headers,
            body: newFormData,
          });
        }
      } catch (parseError) {
        console.error('Error parsing form data for HEIC conversion:', parseError);
      }
    }

    const result = await handleFileUpload(processedRequest, folder);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    await prisma.temporaryFile.create({
      data: {
        fileKey: result.key!,
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