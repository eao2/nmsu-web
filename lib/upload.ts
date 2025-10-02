import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function handleFileUpload(
  request: NextRequest,
  folder: string = 'general'
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return { error: 'Файл олдсонгүй' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return {
      success: true,
      path: `/uploads/${folder}/${filename}`,
      filename,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return { error: 'Файл хуулахад алдаа гарлаа' };
  }
}
