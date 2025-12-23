-- AlterTable
ALTER TABLE "users" ADD COLUMN "email_verified" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "email_verification_token" TEXT;
ALTER TABLE "users" ADD COLUMN "reset_password_token" TEXT;
ALTER TABLE "users" ADD COLUMN "reset_password_expires" DATETIME;

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "point_transactions_user_id_idx" ON "point_transactions"("user_id");
CREATE INDEX "point_transactions_created_at_idx" ON "point_transactions"("created_at");
