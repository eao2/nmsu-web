// lib/image-downloader.ts

import fetch from "node-fetch";
import sharp from "sharp";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"; // Import DeleteObjectCommand
import { s3Client } from "./s3-client";

/**
 * Downloads a user's profile image, processes it, and saves it to MinIO.
 * @param {string} url - The external image URL.
 * @param {string} userId - The unique user ID.
 * @returns {Promise<string>} The MinIO key of the saved image (e.g., "avatars-timestamp-123.png").
 */
export async function downloadAndSaveProfileImage(
  url: string,
  userId: string
): Promise<string> {
  
  try {
    const highQualityUrl = url.replace(/=s\d+-c/, "=s800-c");
    const response = await fetch(highQualityUrl);

    const buffer = Buffer.from(await response.arrayBuffer());
    const optimizedImage = await sharp(buffer)
      .resize(512, 512, { fit: "cover" })
      .png({ compressionLevel: 0 })
      .toBuffer();

    const folder = "avatars";
    const timestamp = Date.now();
    const filename = `${timestamp}-${userId}.png`;
    const key = `${folder}-${filename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: optimizedImage,
        ContentType: "image/png",
      })
    );
    
    return key;
  } catch (error) {
    console.error("Failed to upload processed image to MinIO:", error);
    throw new Error("Could not save the processed profile image.");
  }
}

/**
 * Deletes an image from the S3 bucket.
 * @param {string} key - The key of the image to delete.
 */
export async function deleteImageFromS3(key: string): Promise<void> {
  if (!key) {
    console.warn("deleteImageFromS3 called with no key.");
    return;
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
    );
    console.log(`Successfully deleted old image: ${key}`);
  } catch (error) {
    console.error(`Failed to delete image from S3: ${key}`, error);
  }
}