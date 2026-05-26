-- AlterTable
ALTER TABLE "workflow" ADD COLUMN "webhookSecret" TEXT;

-- AlterTable
ALTER TABLE "execution" ADD COLUMN "input" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "workflow_webhookSecret_key" ON "workflow"("webhookSecret");
