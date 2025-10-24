-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "student";

-- CreateTable
CREATE TABLE "student"."Student" (
    "student_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "enrollment_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "student"."Student"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "student"."Student"("email");
