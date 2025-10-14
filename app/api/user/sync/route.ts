// app/api/user/sync/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadAndSaveProfileImage } from "@/lib/image-downloader";

export async function POST(req: Request) {
  try {
    const user = await req.json();
    
    console.log(user)

    if (!user.email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({ where: { email: user.email } });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });
    }
    if (user.image) {
    const newUrl = await downloadAndSaveProfileImage(user.image, dbUser.id);
    await prisma.user.update({
        where: { id: dbUser.id },
        data: { image: newUrl },
    });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to sync user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
