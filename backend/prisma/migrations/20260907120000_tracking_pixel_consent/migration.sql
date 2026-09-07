-- Adeguamento alle Linee Guida del Garante in materia di utilizzo di tracking
-- pixel nelle comunicazioni di posta elettronica (provv. 17 aprile 2026,
-- G.U. 29 aprile 2026, termine di adeguamento 29 ottobre 2026).

-- CONSENSO ALLA RICEZIONE: deve essere dimostrabile (art. 7 par. 1 GDPR)
ALTER TABLE "Subscriber" ADD COLUMN "consentAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN "consentSource" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN "consentText" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN "consentIp" TEXT;

-- CONSENSO AL TRACCIAMENTO: revocabile in forma granulare, cioe' senza che
-- l'interessato debba rinunciare a ricevere le comunicazioni (par. 6).
-- Il default TRUE riflette il regime transitorio previsto dal provvedimento
-- per i trattamenti gia' in corso: il consenso unico gia' raccolto resta
-- valido finche' l'interessato non lo revoca.
ALTER TABLE "Subscriber" ADD COLUMN "trackingConsent" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Subscriber" ADD COLUMN "trackingConsentAt" TIMESTAMP(3);

-- IDENTIFICATIVO OPACO E NON SEQUENZIALE: viaggia nei pixel al posto
-- dell'indirizzo e-mail, che non deve essere "ricompreso nella richiesta
-- tecnica generata dal caricamento del pixel" (par. 6, privacy by design).
ALTER TABLE "Subscriber" ADD COLUMN "trackingId" TEXT;
UPDATE "Subscriber"
   SET "trackingId" = md5(random()::text || clock_timestamp()::text || "id")
 WHERE "trackingId" IS NULL;
ALTER TABLE "Subscriber" ALTER COLUMN "trackingId" SET NOT NULL;
CREATE UNIQUE INDEX "Subscriber_trackingId_key" ON "Subscriber"("trackingId");

-- BACKFILL: per gli iscritti gia' presenti la data di iscrizione e' la
-- migliore evidenza disponibile del momento in cui il consenso e' stato reso.
UPDATE "Subscriber" SET "consentAt" = "subscribedAt" WHERE "consentAt" IS NULL;

-- REGISTRO DELLE SCELTE
CREATE TYPE "ConsentType" AS ENUM ('NEWSLETTER', 'TRACKING');

CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "text" TEXT,
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsentLog_subscriberId_createdAt_idx" ON "ConsentLog"("subscriberId", "createdAt");

ALTER TABLE "ConsentLog" ADD CONSTRAINT "ConsentLog_subscriberId_fkey"
    FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
