-- CreateTable
CREATE TABLE "EmailList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriberList" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriberList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailCampaignToEmailList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailCampaignToEmailList_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailList_name_key" ON "EmailList"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriberList_subscriberId_listId_key" ON "SubscriberList"("subscriberId", "listId");

-- CreateIndex
CREATE INDEX "_EmailCampaignToEmailList_B_index" ON "_EmailCampaignToEmailList"("B");

-- AddForeignKey
ALTER TABLE "SubscriberList" ADD CONSTRAINT "SubscriberList_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriberList" ADD CONSTRAINT "SubscriberList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "EmailList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailCampaignToEmailList" ADD CONSTRAINT "_EmailCampaignToEmailList_A_fkey" FOREIGN KEY ("A") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailCampaignToEmailList" ADD CONSTRAINT "_EmailCampaignToEmailList_B_fkey" FOREIGN KEY ("B") REFERENCES "EmailList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
