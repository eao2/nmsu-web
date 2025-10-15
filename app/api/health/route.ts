import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { s3Client } from '@/lib/s3-client';
import { HeadBucketCommand } from '@aws-sdk/client-s3';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  time?: number;
  output?: string;
}

export async function GET(request: NextRequest) {
  const checks: HealthCheck[] = [];
  const startTime = Date.now();

  // Database Check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'database',
      status: 'pass',
      time: Date.now() - dbStart,
    });
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'fail',
      time: Date.now() - dbStart,
      output: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // S3 Check
  const s3Start = Date.now();
  try {
    await s3Client.send(new HeadBucketCommand({ 
      Bucket: process.env.S3_BUCKET_NAME! 
    }));
    checks.push({
      name: 's3_storage',
      status: 'pass',
      time: Date.now() - s3Start,
    });
  } catch (error) {
    checks.push({
      name: 's3_storage',
      status: 'fail',
      time: Date.now() - s3Start,
      output: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Memory Check
  const memUsage = process.memoryUsage();
  const memCheck: HealthCheck = {
    name: 'memory',
    status: 'pass',
    output: JSON.stringify({
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    }),
  };

  // Warn if heap usage is over 80%
  if (memUsage.heapUsed / memUsage.heapTotal > 0.8) {
    memCheck.status = 'warn';
  }

  checks.push(memCheck);

  const allPassed = checks.every(check => check.status === 'pass');
  const hasFailures = checks.some(check => check.status === 'fail');

  return NextResponse.json(
    {
      status: hasFailures ? 'fail' : allPassed ? 'pass' : 'warn',
      version: '1.0.0',
      releaseId: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      checks,
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    },
    { status: hasFailures ? 503 : 200 }
  );
}