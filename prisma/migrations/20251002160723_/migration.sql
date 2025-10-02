/*
  Warnings:

  - You are about to drop the column `isClosed` on the `ActivitySession` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ActivitySession` table. All the data in the column will be lost.
  - You are about to drop the `AttendanceEntry` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clubId,date]` on the table `ActivitySession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."ActivitySession" DROP CONSTRAINT "ActivitySession_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendanceEntry" DROP CONSTRAINT "AttendanceEntry_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendanceEntry" DROP CONSTRAINT "AttendanceEntry_userId_fkey";

-- DropIndex
DROP INDEX "public"."ActivitySession_clubId_date_idx";

-- AlterTable
ALTER TABLE "ActivitySession" DROP COLUMN "isClosed",
DROP COLUMN "title",
ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."AttendanceEntry";

-- CreateTable
CREATE TABLE "ActivityAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityAttendance_sessionId_idx" ON "ActivityAttendance"("sessionId");

-- CreateIndex
CREATE INDEX "ActivityAttendance_userId_idx" ON "ActivityAttendance"("userId");

-- CreateIndex
CREATE INDEX "ActivityAttendance_status_idx" ON "ActivityAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAttendance_sessionId_userId_key" ON "ActivityAttendance"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "ActivitySession_clubId_idx" ON "ActivitySession"("clubId");

-- CreateIndex
CREATE INDEX "ActivitySession_date_idx" ON "ActivitySession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySession_clubId_date_key" ON "ActivitySession"("clubId", "date");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "Club_creatorId_idx" ON "Club"("creatorId");

-- CreateIndex
CREATE INDEX "Club_isActive_idx" ON "Club"("isActive");

-- CreateIndex
CREATE INDEX "Club_isConfirmed_idx" ON "Club"("isConfirmed");

-- CreateIndex
CREATE INDEX "ClubMember_clubId_idx" ON "ClubMember"("clubId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "GlobalEvent_isActive_idx" ON "GlobalEvent"("isActive");

-- CreateIndex
CREATE INDEX "GlobalEvent_startDate_idx" ON "GlobalEvent"("startDate");

-- CreateIndex
CREATE INDEX "GlobalEvent_endDate_idx" ON "GlobalEvent"("endDate");

-- CreateIndex
CREATE INDEX "JoinRequest_clubId_idx" ON "JoinRequest"("clubId");

-- CreateIndex
CREATE INDEX "JoinRequest_userId_idx" ON "JoinRequest"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "Report_clubId_year_semester_idx" ON "Report"("clubId", "year", "semester");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_studentCode_idx" ON "User"("studentCode");

-- CreateIndex
CREATE INDEX "User_className_idx" ON "User"("className");

-- AddForeignKey
ALTER TABLE "ActivitySession" ADD CONSTRAINT "ActivitySession_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttendance" ADD CONSTRAINT "ActivityAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ActivitySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttendance" ADD CONSTRAINT "ActivityAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
