// lib/utils.ts

import { prisma } from './prisma';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function extractStudentCode(email: string): string | null {
  const match = email.match(/^(\d+)@/);
  return match ? match[1] : null;
}

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
}: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
}) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details: details || {},
    },
  });
}