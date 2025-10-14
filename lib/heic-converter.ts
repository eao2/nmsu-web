// lib/heic-converter.ts
import heicConvert from 'heic-convert';

export async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    const outputBuffer = await heicConvert({
      buffer: buffer.buffer,
      format: 'JPEG',
      quality: 1, 
    });

    return Buffer.from(outputBuffer);
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error('Failed to convert HEIC image');
  }
}

export function isHeicFile(filename: string, mimeType?: string): boolean {
  const heicExtensions = ['.heic', '.HEIC'];
  const hasHeicExtension = heicExtensions.some(ext => filename.endsWith(ext));
  const hasHeicMimeType = mimeType === 'image/heic' || mimeType === 'image/heif';
  
  return hasHeicExtension || hasHeicMimeType;
}