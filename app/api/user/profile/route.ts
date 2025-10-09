// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateProfileBody {
  phone: string;
  className: string;
  studentCode: string;
  profileComplete: boolean;
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Нэвтрэх шаардлагатай" },
        { status: 401 }
      );
    }

    const body: UpdateProfileBody = await request.json();
    const { phone, className, studentCode, profileComplete } = body;

    if (!phone || !className || !studentCode) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү." },
        { status: 400 }
      );
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: "Утасны дугаар 8 оронтой тоо байна." },
        { status: 400 }
      );
    }

    const standardizedStudentCode = studentCode.trim().toUpperCase();

    const existingUserWithStudentCode = await prisma.user.findFirst({
      where: {
        studentCode: standardizedStudentCode,

        id: {
          not: session.user.id,
        },
      },
    });

    if (existingUserWithStudentCode) {
      return NextResponse.json(
        { error: "Энэ оюутны код бүртгэлтэй байна." },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: phone.trim(),
        className: className.trim().toUpperCase(),
        studentCode: standardizedStudentCode,
        profileComplete: Boolean(profileComplete),
      },

      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        className: true,
        studentCode: true,
        profileComplete: true,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Оюутны код эсвэл өөр нэг талбар давхацсан байна." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Профайл шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
