import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-client';

/**
 * Downloads, processes and uploads profile image to S3
 */
async function processAndUploadImage(url: string, userId: string): Promise<string> {
  try {
    const highQualityUrl = url.replace(/=s\d+-c/, '=s800-c');
    const response = await fetch(highQualityUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const optimizedImage = await sharp(buffer)
      .resize(512, 512, { fit: 'cover' })
      .png({ compressionLevel: 0 })
      .toBuffer();

    const folder = 'avatars';
    const timestamp = Date.now();
    const filename = `${timestamp}-${userId}.png`;
    const key = `${folder}-${filename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: optimizedImage,
        ContentType: 'image/png',
      })
    );

    return key;
  } catch (error) {
    console.error('Failed to process and upload image:', error);
    throw new Error('Could not save the processed profile image.');
  }
}

/**
 * Deletes image from S3
 */
async function deleteImageFromS3(key: string): Promise<void> {
  if (!key) {
    console.warn('deleteImageFromS3 called with no key.');
    return;
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
    );
    console.log(`✅ Successfully deleted old image: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to delete image from S3: ${key}`, error);
  }
}

/**
 * POST: Update user's profile image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Зургийн URL шаардлагатай' },
        { status: 400 }
      );
    }

    // Get current user's image
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    const previousImageKey = currentUser?.image;

    // Process and upload new image
    console.log('🖼️  Processing profile image for user:', userId);
    const newImageKey = await processAndUploadImage(imageUrl, userId);

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: { image: newImageKey },
    });

    // Delete old image
    if (previousImageKey) {
      await deleteImageFromS3(previousImageKey);
    }

    return NextResponse.json({
      success: true,
      imageKey: newImageKey,
      message: 'Профайл зураг амжилттай шинэчлэгдлээ',
    });
  } catch (error) {
    console.error('❌ Error updating profile image:', error);
    return NextResponse.json(
      { error: 'Профайл зураг шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove user's profile image
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (currentUser?.image) {
      await deleteImageFromS3(currentUser.image);

      await prisma.user.update({
        where: { id: userId },
        data: { image: null },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Профайл зураг амжилттай устгагдлаа',
    });
  } catch (error) {
    console.error('❌ Error deleting profile image:', error);
    return NextResponse.json(
      { error: 'Профайл зураг устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

/**
 * GET: Get current user's profile image key
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    return NextResponse.json({
      success: true,
      imageKey: user?.image || null,
    });
  } catch (error) {
    console.error('❌ Error fetching profile image:', error);
    return NextResponse.json(
      { error: 'Профайл зураг татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
