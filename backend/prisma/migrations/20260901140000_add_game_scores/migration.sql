-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('NONE', 'ALL_TIME', 'DAILY');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "leaderboard" "LeaderboardPeriod" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "detail" TEXT,
    "periodKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameScore_gameId_periodKey_score_idx" ON "GameScore"("gameId", "periodKey", "score");

-- CreateIndex
CREATE UNIQUE INDEX "GameScore_gameId_periodKey_playerName_key" ON "GameScore"("gameId", "periodKey", "playerName");

-- AddForeignKey
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
