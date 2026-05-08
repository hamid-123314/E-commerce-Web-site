-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imagePublicId" TEXT,
ALTER COLUMN "imageUrl" SET DEFAULT 'https://via.placeholder.com/300';
