-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'bell',
    "lead_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
