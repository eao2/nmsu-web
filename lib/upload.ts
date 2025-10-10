import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

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

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${folder}/${filename}`;

    return {
      success: true,
      path: publicPath,
      filename,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      folder,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('File upload error:', error);
    return { error: 'Файл хуулах явцад алдаа гарлаа' };
  }
}
