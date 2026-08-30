-- AlterTable
ALTER TABLE "products" ADD COLUMN     "exam_id" INTEGER,
ADD COLUMN     "topic_id" INTEGER;

-- CreateTable
CREATE TABLE "exams" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exams_code_key" ON "exams"("code");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
