/*
  Warnings:

  - You are about to drop the column `subscriberAt` on the `Subscriber` table. All the data in the column will be lost.
  - You are about to drop the column `unsubscriberAt` on the `Subscriber` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Subscriber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscriber" DROP COLUMN "subscriberAt",
DROP COLUMN "unsubscriberAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
