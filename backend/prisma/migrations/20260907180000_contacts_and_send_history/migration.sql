-- Cronologia degli invii e rubrica dei destinatari manuali.

-- Il log registrava solo che un invio era avvenuto: senza destinatario e
-- oggetto non era possibile ricostruire nulla, e le anteprime producevano
-- righe prive di qualunque riferimento.
ALTER TABLE "EmailLog" ADD COLUMN "recipientEmail" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN "subject" TEXT;

CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");
CREATE INDEX "EmailLog_recipientEmail_idx" ON "EmailLog"("recipientEmail");

-- RUBRICA.
-- Deliberatamente separata da "Subscriber": raccoglie gli indirizzi usati
-- negli invii manuali, che non hanno prestato alcun consenso a ricevere
-- comunicazioni promozionali. Nessuna campagna deve poter selezionare da qui.
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "note" TEXT,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,
    "firstUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");
CREATE INDEX "Contact_lastUsedAt_idx" ON "Contact"("lastUsedAt");
