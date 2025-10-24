-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "teacher";

-- CreateTable
CREATE TABLE "teacher"."Teacher" (
    "teacher_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "expertise" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "teacher"."Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "teacher"."Teacher"("phone");
