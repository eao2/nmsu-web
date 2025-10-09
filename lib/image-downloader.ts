// lib/image-downloader.ts
import fetch from "node-fetch";
import sharp from "sharp";
import { writeFile, mkdir, unlink, access } from "fs/promises";
import { constants } from "fs";
import { join, extname } from "path";

/**
 * Downloads and saves a user's profile image as a high-quality PNG.
 * Overwrites previous images to avoid duplicates and cleans up old extensions.
 * @param {string} url - The external image URL (e.g., Google profile picture).
 * @param {string} userId - The unique user ID (used for the filename).
 * @returns {Promise<string>} The new public path (e.g., /uploads/avatars/123.png).
 */
export async function downloadAndSaveProfileImage(
  url: string,
  userId: string
): Promise<string> {
  const highQualityUrl = url.replace(/=s\d+-c/, "=s800-c");

  const response = await fetch(highQualityUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }

  const folder = "avatars";
  const uploadDir = join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });

  const filename = `${userId}.png`;
  const filepath = join(uploadDir, filename);

  const possibleExtensions = [".jpg", ".jpeg", ".webp"];

  const cleanupPromises = possibleExtensions.map(async (ext) => {
    const oldPath = join(uploadDir, `${userId}${ext}`);

    try {
      await unlink(oldPath);
    } catch (err) {
      if (err instanceof Error && "code" in err && err.code === "ENOENT") {
        return;
      }

      console.warn(`Cleanup warning for ${oldPath}:`, err);
    }
  });

  await Promise.all(cleanupPromises);

  const buffer = Buffer.from(await response.arrayBuffer());
  const optimizedImage = await sharp(buffer)
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 0 })
    .toBuffer();

  await writeFile(filepath, optimizedImage);

  return `/uploads/${folder}/${filename}`;
}
