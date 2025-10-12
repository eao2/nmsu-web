// lib/s3-client.js
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT, // This is the key change for MinIO
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  // This is required for MinIO
  forcePathStyle: true, 
});