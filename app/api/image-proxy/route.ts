// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3-client";
import sharp from "sharp";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const width = parseInt(searchParams.get("w") || "0");
    const quality = parseInt(searchParams.get("q") || "75");

    if (!key) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }

    // Security check
    const decodedKey = decodeURIComponent(key);
    if (
      decodedKey.includes("..") || 
      decodedKey.startsWith("/") || 
      decodedKey.includes("\\") ||
      decodedKey.match(/^[a-z]:/i)
    ) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const normalizedKey = key.replace(/\/+/g, '/');

    // Fetch from S3
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: normalizedKey,
    });
    
    const response = await s3Client.send(command);

    // Use transformToByteArray - this is the cleanest way
    const byteArray = await response.Body?.transformToByteArray();
    if (!byteArray) {
      throw new Error("Failed to read image data");
    }
    
    const buffer = Buffer.from(byteArray);

    // Check if it's an image
    const contentType = response.ContentType || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ 
        error: "Not an image", 
        contentType 
      }, { status: 400 });
    }

    // Optimize with sharp
    let sharpInstance = sharp(buffer);
    
    if (width > 0) {
      sharpInstance = sharpInstance.resize(width, null, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Determine format and optimize
    let optimizedBuffer: Buffer;
    let outputContentType: string;

    if (contentType.includes("png")) {
      optimizedBuffer = await sharpInstance
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
      outputContentType = "image/png";
    } else if (contentType.includes("webp")) {
      optimizedBuffer = await sharpInstance
        .webp({ quality })
        .toBuffer();
      outputContentType = "image/webp";
    } else if (contentType.includes("gif")) {
      optimizedBuffer = await sharpInstance
        .gif()
        .toBuffer();
      outputContentType = "image/gif";
    } else {
      optimizedBuffer = await sharpInstance
        .jpeg({ quality, progressive: true })
        .toBuffer();
      outputContentType = "image/jpeg";
    }

    return new NextResponse(optimizedBuffer as any, {
      headers: {
        "Content-Type": outputContentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Error optimizing image:", error);
    
    if (error instanceof S3ServiceException && error.name === "NoSuchKey") {
      return NextResponse.json({ 
        error: "Image not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: "Could not process image",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}