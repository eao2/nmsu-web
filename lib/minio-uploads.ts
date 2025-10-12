// lib/minio-uploads.ts

import { NextRequest } from 'next/server';
import { PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3-client';
import { extname } from 'path';

export async function handleFileUpload(
  request: NextRequest,
  folder: string = 'general'
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return { error: 'Файл илгээгдсэнгүй' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.toLowerCase().replace(/\s+/g, '_');
    const safeName = originalName.replace(/[^a-z0-9._-]/g, '');
    const ext = extname(safeName) || '';
    const filename = `${Date.now()}-${safeName.replace(ext, '')}${ext}`;

    const key = `${folder}-${filename}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    return {
      success: true,
      key: key,
      filename,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      folder,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('MinIO upload error:', error);
    return { error: 'Файл хуулах явцад алдаа гарлаа' };
  }
}

/**
 * Deletes files from MinIO given an array of their keys.
 * @param {string[]} keys - An array of file keys to remove (e.g., ['uploads-avatars-123.png']).
 * @returns {Promise<void>}
 */
export async function deleteFilesByKey(keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) return;

    const validKeys = keys.filter(key => key != null && key.trim() !== '');

    if (validKeys.length === 0) return;
    
    const objectsToDelete = validKeys.map(key => ({ Key: key }));

    try {
        await s3Client.send(new DeleteObjectsCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Delete: { Objects: objectsToDelete },
        }));
        console.log('Successfully deleted files from MinIO by key.');
    } catch (err) {
        console.error('Error deleting files from MinIO by key', err);
    }
}