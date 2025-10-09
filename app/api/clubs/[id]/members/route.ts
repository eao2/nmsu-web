// app/api/clubs/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/utils';

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
        { error: 'Зөвхөн админ гишүүн нэмэх боломжтой' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, userId, makeAdmin } = body;

    if (action === 'remove') {
      await prisma.clubMember.delete({
        where: {
          clubId_userId: {
            clubId: clubId,
            userId,
          },
        },
      });

      await logAudit({
        userId: session.user.id,
        action: 'REMOVE_MEMBER',
        entity: 'ClubMember',
        entityId: clubId,
        details: { removedUserId: userId },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'toggleAdmin') {
      const updated = await prisma.clubMember.update({
        where: {
          clubId_userId: {
            clubId: clubId,
            userId,
          },
        },
        data: { isAdmin: makeAdmin },
      });

      await logAudit({
        userId: session.user.id,
        action: 'TOGGLE_ADMIN',
        entity: 'ClubMember',
        entityId: clubId,
        details: { targetUserId: userId, isAdmin: makeAdmin },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: 'Буруу үйлдэл' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Member action error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}