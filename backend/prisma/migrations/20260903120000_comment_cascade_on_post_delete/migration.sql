-- Consente l'eliminazione di un post che ha commenti.
-- Il vincolo era ON DELETE RESTRICT (default Prisma per relazioni obbligatorie),
-- quindi PostgreSQL bloccava la DELETE di qualsiasi post con almeno un commento,
-- inclusi quelli PENDING/SPAM non visibili nel pannello admin.

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
