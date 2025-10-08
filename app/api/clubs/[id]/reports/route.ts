import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { confirmUploadedFiles } from '@/lib/confirmUploadedFiles';
import { ca } from 'date-fns/locale';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { deleteFiles } from '@/lib/deleteFiles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: clubId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const reports = await prisma.report.findMany({
      where: { clubId: clubId },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Тайлан татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id: clubId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: clubId,
          userId: session.user.id,
        },
      },
    });

    if (!member?.isAdmin && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ тайлан нэмэх боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, semester, year, filePath } = body;

    if (!title || !semester || !year || !filePath) {
      return NextResponse.json(
        { error: 'Бүх талбар шаардлагатай' },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        clubId: clubId,
        title,
        semester,
        year: parseInt(year),
        filePath,
      },
    });

    confirmUploadedFiles([filePath]);

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Тайлан үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }){

  try {
    const { id: clubId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }
    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId: session.user.id,
        },
      },
    });
    if (!member?.isAdmin && session.user.role !== 'UNIVERSAL_ADMIN') {
      return NextResponse.json(
        { error: 'Зөвхөн админ тайлан устгах боломжтой' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { reportId } = body;
    if (!reportId) {
      return NextResponse.json(
        { error: 'Тайлан ID шаардлагатай' },
        { status: 400 }
      );
    }
    const report = await prisma.report.delete({
      where: { id: reportId, clubId: clubId },
    });

    if(report.filePath){
      deleteFiles([report.filePath]);
    }

    return NextResponse.json({ success: true });

  }catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Тайлан устгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}