// app/api/user/session/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        profileComplete: true,
        image: true,
      },
    });

    return NextResponse.json(user ?? {});
  } catch (error) {
    console.error("❌ Error fetching session data:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
