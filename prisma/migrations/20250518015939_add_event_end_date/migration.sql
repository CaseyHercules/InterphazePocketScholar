/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentId]` on the table `EventRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_stripePaymentId_key" ON "EventRegistration"("stripePaymentId");
