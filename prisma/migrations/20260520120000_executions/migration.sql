-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "execution" (
    "id" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "logs" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "execution_workflowId_idx" ON "execution"("workflowId");

-- CreateIndex
CREATE INDEX "execution_userId_idx" ON "execution"("userId");

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
