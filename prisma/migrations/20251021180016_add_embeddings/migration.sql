-- AlterTable
ALTER TABLE "File" ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "indexed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "indexedAt" TIMESTAMP(3),
ADD COLUMN     "textContent" TEXT;
