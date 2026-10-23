-- CAMPAGNE CON PIXEL DA LASCIARE INVARIATI.
-- Alcuni inserzionisti chiedono che il pixel della creativita' venga inserito
-- cosi' com'e', senza associarvi alcun identificativo del destinatario: per
-- quelle campagne le macro {email} non vengono sostituite. Il default FALSE
-- conserva il comportamento attuale per tutte le altre.
ALTER TABLE "EmailCampaign" ADD COLUMN "skipTrackingMacros" BOOLEAN NOT NULL DEFAULT false;
