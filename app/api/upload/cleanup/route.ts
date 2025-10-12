// app/api/upload/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFilesByKey } from "@/lib/minio-uploads";

export async function POST(request: NextRequest) {
  try {
    const expirationDate = new Date();

    const expiredFiles = await prisma.temporaryFile.findMany({
      where: {
        expiresAt: {
          lt: expirationDate,
        },
      },
      select: {
        fileKey: true,
      },
    });

    const fileKeysToDelete = expiredFiles.map((file) => file.fileKey);

    await deleteFilesByKey(fileKeysToDelete);

    const dbDeletionResult = await prisma.temporaryFile.deleteMany({
      where: {
        expiresAt: {
          lt: expirationDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: dbDeletionResult.count,
      filesProcessed: expiredFiles.length,
    });
  } catch (error) {
    console.error("Cleanup error:", error);

    return new NextResponse(JSON.stringify({ error: "Алдаа гарлаа" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
