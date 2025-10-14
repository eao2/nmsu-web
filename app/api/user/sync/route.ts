import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadAndSaveProfileImage } from "@/lib/image-downloader";

/**
 * Ensures that a user and their linked account exist.
 * Called from frontend (NextAuth signIn callback).
 */
export async function POST(req: Request) {
  try {
    const user = await req.json();

    if (!user.email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const provider = "google";
    const providerAccountId = user.id?.toString() ?? user.sub ?? "";

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { accounts: true },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          accounts: {
            create: {
              provider,
              providerAccountId,
              type: "oauth",
            },
          },
        },
        include: { accounts: true },
      });

      if (user.image) {
        try {
          const newImageUrl = await downloadAndSaveProfileImage(user.image, dbUser.id);
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { image: newImageUrl },
          });
          dbUser.image = newImageUrl;
        } catch (err) {
          console.warn("⚠️ Failed to download user image:", err);
        }
      }

      return NextResponse.json({ created: true, userId: dbUser.id });
    }

    if (user.image) {
      try {
        const newImageUrl = await downloadAndSaveProfileImage(user.image, dbUser.id);
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { image: newImageUrl },
        });
        dbUser.image = newImageUrl;
      } catch (err) {
        console.warn("⚠️ Failed to download user image:", err);
      }
    }

    const hasAccount = dbUser.accounts.some(
      (a) => a.provider === provider && a.providerAccountId === providerAccountId
    );

    if (!hasAccount) {
      await prisma.account.create({
        data: {
          userId: dbUser.id,
          provider,
          providerAccountId,
          type: "oauth",
        },
      });
    }

    return NextResponse.json({ created: false, userId: dbUser.id });
  } catch (error) {
    console.error("❌ Failed to sync user/account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
