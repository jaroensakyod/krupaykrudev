-- CreateTable
CREATE TABLE "launch_flags" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "launched_at" TIMESTAMP(3),

    CONSTRAINT "launch_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "launch_flags_key_key" ON "launch_flags"("key");
