-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'SPAM', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "passwordHashed" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "images" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescr" TEXT,
    "tags" TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postID" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscriberAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscriberAt" TIMESTAMP(3),
    "source" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postID_fkey" FOREIGN KEY ("postID") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
