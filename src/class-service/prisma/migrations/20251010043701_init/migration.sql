-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "class";

-- CreateEnum
CREATE TYPE "class"."Role" AS ENUM ('owner', 'manager', 'viewer');

-- CreateTable
CREATE TABLE "class"."Class" (
    "class_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    "class_name" TEXT NOT NULL,
    "schedule" JSONB,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "class"."Enrollment" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class"."UserClass" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "class"."Role" NOT NULL,

    CONSTRAINT "UserClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_student_id_class_id_key" ON "class"."Enrollment"("student_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserClass_class_id_user_id_key" ON "class"."UserClass"("class_id", "user_id");

-- AddForeignKey
ALTER TABLE "class"."Enrollment" ADD CONSTRAINT "Enrollment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"."Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class"."UserClass" ADD CONSTRAINT "UserClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"."Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;
