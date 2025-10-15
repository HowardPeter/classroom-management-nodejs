-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tuition";

-- CreateEnum
CREATE TYPE "tuition"."InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "tuition"."PaymentMethod" AS ENUM ('CASH', 'BANK', 'MOMO', 'OTHER');

-- CreateTable
CREATE TABLE "tuition"."Invoice" (
    "invoice_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "description" TEXT,
    "required_amount" DECIMAL(65,30) NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "tuition"."InvoiceStatus" DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "tuition"."Payment" (
    "payment_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" "tuition"."PaymentMethod",
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- AddForeignKey
ALTER TABLE "tuition"."Payment" ADD CONSTRAINT "Payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "tuition"."Invoice"("invoice_id") ON DELETE CASCADE ON UPDATE CASCADE;
