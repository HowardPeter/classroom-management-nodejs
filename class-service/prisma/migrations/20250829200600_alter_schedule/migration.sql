/*
  Warnings:

  - The `schedule` column on the `Class` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Class" DROP COLUMN "schedule",
ADD COLUMN     "schedule" JSONB;
