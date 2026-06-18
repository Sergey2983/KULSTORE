-- CreateEnum
CREATE TYPE "BrandTier" AS ENUM ('SPORT', 'LUXURY');

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "tier" "BrandTier" NOT NULL DEFAULT 'SPORT';
