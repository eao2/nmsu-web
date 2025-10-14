// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
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

    if (key.includes("..") || key.includes("//")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    const buffer = await streamToBuffer(response.Body as ReadableStream);

    let sharpInstance = sharp(buffer);
    
    if (width > 0) {
      sharpInstance = sharpInstance.resize(width, null, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const contentType = response.ContentType || "image/jpeg";
    let optimizedBuffer: Buffer;

    if (contentType.includes("png")) {
      optimizedBuffer = await sharpInstance
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
    } else if (contentType.includes("webp")) {
      optimizedBuffer = await sharpInstance
        .webp({ quality })
        .toBuffer();
    } else {
      optimizedBuffer = await sharpInstance
        .jpeg({ quality, progressive: true })
        .toBuffer();
    }

    return new NextResponse(optimizedBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error optimizing image:", error);
    return NextResponse.json({ error: "Could not process image" }, { status: 500 });
  }
}

async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}