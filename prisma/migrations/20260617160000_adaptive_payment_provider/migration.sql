ALTER TABLE "Payment" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'yookassa';
ALTER TABLE "Payment" ADD COLUMN "providerPaymentId" TEXT;

UPDATE "Payment"
SET "providerPaymentId" = "yookassaId"
WHERE "providerPaymentId" IS NULL;

ALTER TABLE "Payment" ALTER COLUMN "providerPaymentId" SET NOT NULL;

DROP INDEX IF EXISTS "Payment_yookassaId_key";
ALTER TABLE "Payment" DROP COLUMN "yookassaId";

CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
CREATE INDEX "Payment_provider_status_idx" ON "Payment"("provider", "status");
