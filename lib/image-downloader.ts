// lib/image-downloader.ts

import fetch from "node-fetch";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3-client";

/**
 * Downloads a user's profile image, processes it, and saves it to MinIO.
 * @param {string} url - The external image URL.
 * @param {string} userId - The unique user ID.
 * @returns {Promise<string>} The MinIO key of the saved image (e.g., "uploads-avatars-123.png").
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

  const buffer = Buffer.from(await response.arrayBuffer());
  const optimizedImage = await sharp(buffer)
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 0 })
    .toBuffer();

  const folder = "avatars";
  const filename = `${userId}.png`;
  const key = `${folder}-${filename}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: optimizedImage,
        ContentType: "image/png",
      })
    );
  } catch (error) {
    console.error("Failed to upload processed image to MinIO:", error);
    throw new Error("Could not save the processed profile image.");
  }

  return key;
}