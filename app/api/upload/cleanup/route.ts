// app/api/upload/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFiles } from "@/lib/deleteFiles";

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
        filePath: true,
      },
    });

    const filePathsToDelete = expiredFiles.map((file) => file.filePath);

    await deleteFiles(filePathsToDelete);

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
