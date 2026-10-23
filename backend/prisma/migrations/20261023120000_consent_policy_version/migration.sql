-- VERSIONE DELL'INFORMATIVA ACCANTO A OGNI SCELTA REGISTRATA.
-- Il testo del consenso era gia' archiviato, ma non quale revisione della
-- Privacy Policy fosse in vigore in quel momento: andava ricostruita dalla
-- data. Le righe esistenti restano NULL, perche' una versione dedotta a
-- posteriori non sarebbe una registrazione.
ALTER TABLE "ConsentLog" ADD COLUMN "policyVersion" TEXT;
