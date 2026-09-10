-- INDICI SULLE COLONNE EFFETTIVAMENTE INTERROGATE
--
-- Nessuna delle tabelle principali aveva indici oltre alle chiavi: ogni
-- elenco filtrava e ordinava con una scansione completa. EmailLog e' il caso
-- piu' pesante, perche' cresce di una riga per ogni destinatario di ogni
-- invio ed e' letta a ogni apertura della lista campagne.
--
-- CONCURRENTLY non e' utilizzabile dentro la transazione di una migration
-- Prisma: su tabelle gia' molto grandi valutare di eseguirli a mano fuori
-- dalla migration.

-- POST
CREATE INDEX IF NOT EXISTS "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Post_status_createdAt_idx" ON "Post"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "Post_isFeatured_featuredAt_idx" ON "Post"("isFeatured", "featuredAt");

-- COMMENT
CREATE INDEX IF NOT EXISTS "Comment_postId_status_idx" ON "Comment"("postId", "status");
CREATE INDEX IF NOT EXISTS "Comment_status_createdAt_idx" ON "Comment"("status", "createdAt");

-- SUBSCRIBER
CREATE INDEX IF NOT EXISTS "Subscriber_status_idx" ON "Subscriber"("status");

-- EMAILLOG
CREATE INDEX IF NOT EXISTS "EmailLog_campaignId_status_idx" ON "EmailLog"("campaignId", "status");
CREATE INDEX IF NOT EXISTS "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");
CREATE INDEX IF NOT EXISTS "EmailLog_subscriberId_idx" ON "EmailLog"("subscriberId");

-- COLONNA MORTA
-- "seoDescr" esisteva accanto a "seoDescription" e non e' mai stata letta ne'
-- scritta da alcun punto del codice: e' un residuo di una rinomina lasciata
-- a meta'.
ALTER TABLE "Post" DROP COLUMN IF EXISTS "seoDescr";
