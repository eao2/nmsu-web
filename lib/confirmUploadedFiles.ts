// lib/confirmUploadedFiles.ts
import { prisma } from '@/lib/prisma'; // Assuming this import key is correct

/**
 * Confirms the upload of temporary files by deleting their entries
 * from the database.
 *
 * @param fileKeys An array of file keys to remove from temporary storage.
 * @returns A promise that resolves when the deletion is complete.
 * @throws An error if the database operation fails.
 */
export async function confirmUploadedFiles(fileKeys: (string | null | undefined)[]): Promise<void> {
  if (!fileKeys || fileKeys.length === 0) {
    return;
  }

  // Filter out null, undefined, and empty string values
  const validFileKeys = fileKeys.filter((key): key is string => 
    key != null && key.trim() !== ''
  );

  if (validFileKeys.length === 0) {
    return;
  }

  console.log('Confirming uploaded files:', validFileKeys);

  try {
    await prisma.temporaryFile.deleteMany({
      where: {
        fileKey: { in: validFileKeys },
      },
    });

  } catch (error) {
    console.error('Error confirming temporary files:', error);

    throw new Error('Failed to confirm temporary file deletion in the database.');
  }
}