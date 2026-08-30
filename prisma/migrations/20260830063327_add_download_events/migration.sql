-- CreateTable
CREATE TABLE "download_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "file_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "download_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "download_events_product_id_idx" ON "download_events"("product_id");

-- CreateIndex
CREATE INDEX "download_events_user_id_idx" ON "download_events"("user_id");
