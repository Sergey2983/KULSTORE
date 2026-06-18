-- Replace numeric stock tracking with a simple in-stock/out-of-stock boolean
ALTER TABLE "ProductVariant" ADD COLUMN "inStock" BOOLEAN NOT NULL DEFAULT true;

UPDATE "ProductVariant" SET "inStock" = ("stock" > 0);

ALTER TABLE "ProductVariant" DROP COLUMN "stock";
