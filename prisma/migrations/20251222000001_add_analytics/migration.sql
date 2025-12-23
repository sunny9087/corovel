-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events"("event_type");
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");
