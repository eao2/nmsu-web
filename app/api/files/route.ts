// app/api/files/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3-client";

export async function GET(request: NextRequest) {
  try {
    // Get the 'key' from the query parameters, e.g., /api/files?key=uploads-avatars-123.png
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    if (key.includes("..") || key.includes("//")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const response = await s3Client.send(command);

    const bodyStream = response.Body as ReadableStream;

    const contentType = response.ContentType || "application/octet-stream";

    return new NextResponse(bodyStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);

    if (error instanceof S3ServiceException && error.name === "NoSuchKey") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not retrieve file" },
      { status: 500 }
    );
  }
}