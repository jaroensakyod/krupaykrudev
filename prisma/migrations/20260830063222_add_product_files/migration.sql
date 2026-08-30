-- CreateEnum
CREATE TYPE "FileRole" AS ENUM ('ORIGINAL', 'BONUS', 'ANSWER', 'SUPPORTING', 'COVER');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'CLEAN', 'FAILED');

-- CreateTable
CREATE TABLE "product_files" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "sha256_hash" TEXT NOT NULL,
    "file_role" "FileRole" NOT NULL DEFAULT 'ORIGINAL',
    "scan_status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_previews" (
    "id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "watermark_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_previews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_files_sha256_hash_idx" ON "product_files"("sha256_hash");

-- CreateIndex
CREATE INDEX "product_files_product_id_idx" ON "product_files"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_previews_file_id_key" ON "product_previews"("file_id");

-- CreateIndex
CREATE INDEX "product_previews_product_id_idx" ON "product_previews"("product_id");

-- AddForeignKey
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_previews" ADD CONSTRAINT "product_previews_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "product_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
