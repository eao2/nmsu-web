// lib/confirmUploadedFiles.ts
import { prisma } from '@/lib/prisma'; // Assuming this import path is correct

/**
 * Confirms the upload of temporary files by deleting their entries
 * from the database.
 *
 * @param filePaths An array of file paths to remove from temporary storage.
 * @returns A promise that resolves when the deletion is complete.
 * @throws An error if the database operation fails.
 */
export async function confirmUploadedFiles(filePaths: (string | null | undefined)[]): Promise<void> {
  if (!filePaths || filePaths.length === 0) {
    return;
  }

  // Filter out null, undefined, and empty string values
  const validFilePaths = filePaths.filter((path): path is string => 
    path != null && path.trim() !== ''
  );

  if (validFilePaths.length === 0) {
    return;
  }

  console.log('Confirming uploaded files:', validFilePaths);

  try {
    await prisma.temporaryFile.deleteMany({
      where: {
        filePath: { in: validFilePaths },
      },
    });

  } catch (error) {
    console.error('Error confirming temporary files:', error);

    throw new Error('Failed to confirm temporary file deletion in the database.');
  }
}