-- CreateTable
CREATE TABLE "search_events" (
    "id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" UUID,
    "raw_query" TEXT NOT NULL,
    "normalized_query" TEXT NOT NULL,
    "filters_json" JSONB,
    "result_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" UUID,
    "product_id" UUID,
    "creator_id" UUID,
    "properties" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_events_created_at_idx" ON "search_events"("created_at");

-- CreateIndex
CREATE INDEX "search_events_result_count_idx" ON "search_events"("result_count");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_product_id_event_type_idx" ON "analytics_events"("product_id", "event_type");
