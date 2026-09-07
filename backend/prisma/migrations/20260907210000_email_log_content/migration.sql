-- Corpo dei messaggi inviati manualmente, per poterli riprendere e rimandare.
-- Nullable e popolato solo per anteprime ed email di test: sulle campagne
-- resta vuoto, altrimenti l'HTML verrebbe duplicato su ogni destinatario.
ALTER TABLE "EmailLog" ADD COLUMN "content" TEXT;
