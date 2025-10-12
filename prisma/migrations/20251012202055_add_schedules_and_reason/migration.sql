-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "reason" TEXT;

-- CreateTable
CREATE TABLE "ClubSchedule" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubSchedule_clubId_idx" ON "ClubSchedule"("clubId");

-- CreateIndex
CREATE INDEX "ClubSchedule_dayOfWeek_idx" ON "ClubSchedule"("dayOfWeek");

-- CreateIndex
CREATE INDEX "ClubSchedule_room_idx" ON "ClubSchedule"("room");

-- CreateIndex
CREATE UNIQUE INDEX "ClubSchedule_room_dayOfWeek_startTime_key" ON "ClubSchedule"("room", "dayOfWeek", "startTime");

-- AddForeignKey
ALTER TABLE "ClubSchedule" ADD CONSTRAINT "ClubSchedule_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
