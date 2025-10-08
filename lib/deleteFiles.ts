import { unlink, rm } from 'fs/promises'; // Import rm
import { join } from 'path';

/**
 * @param filePaths An array of file paths to remove from temporary storage.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteFiles(filePaths: (string | null | undefined)[]): Promise<void> {
    if (!filePaths || filePaths.length === 0) {
        return;
    }

    const validFilePaths = filePaths.filter((path): path is string => 
        path != null && path.trim() !== ''
    );

    if (validFilePaths.length === 0) {
        return;
    }
    
    await Promise.all(
        validFilePaths.map(async (path) => {
            const filePath = join(process.cwd(), 'public', path);
            
            try {
                await rm(filePath, { force: true });
            } catch (err) {
                console.error(`Error deleting file: ${path}`, err);
            }
        })
    );
}