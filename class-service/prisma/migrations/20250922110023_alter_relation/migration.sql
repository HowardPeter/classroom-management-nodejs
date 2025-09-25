/*
  Warnings:

  - A unique constraint covering the columns `[student_id,class_id]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[class_id,user_id]` on the table `UserClass` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Enrollment" DROP CONSTRAINT "Enrollment_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserClass" DROP CONSTRAINT "UserClass_class_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_student_id_class_id_key" ON "public"."Enrollment"("student_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserClass_class_id_user_id_key" ON "public"."UserClass"("class_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserClass" ADD CONSTRAINT "UserClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;
