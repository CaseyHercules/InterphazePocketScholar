-- CreateTable
CREATE TABLE "EventTicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTicketType_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "EventRegistration"
ADD COLUMN "ticketTypeId" TEXT,
ADD COLUMN "promoCodeId" TEXT,
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "amountPaidCents" INTEGER,
ADD COLUMN "currency" TEXT DEFAULT 'usd',
ADD COLUMN "discountAmountCents" INTEGER,
ADD COLUMN "answers" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "EventTicketType_eventId_slug_key" ON "EventTicketType"("eventId", "slug");

-- CreateIndex
CREATE INDEX "EventTicketType_eventId_sortOrder_idx" ON "EventTicketType"("eventId", "sortOrder");

-- CreateIndex
CREATE INDEX "EventTicketType_stripePriceId_idx" ON "EventTicketType"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_stripeCheckoutSessionId_key" ON "EventRegistration"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_stripePaymentIntentId_key" ON "EventRegistration"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "EventRegistration_ticketTypeId_idx" ON "EventRegistration"("ticketTypeId");

-- CreateIndex
CREATE INDEX "EventRegistration_promoCodeId_idx" ON "EventRegistration"("promoCodeId");

-- CreateIndex
CREATE INDEX "EventRegistration_stripeCheckoutSessionId_idx" ON "EventRegistration"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "EventRegistration_stripePaymentIntentId_idx" ON "EventRegistration"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "PromoCode"
ADD CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventTicketType"
ADD CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventRegistration"
ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventRegistration"
ADD CONSTRAINT "EventRegistration_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventRegistration"
ADD CONSTRAINT "EventRegistration_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE RESTRICT;
