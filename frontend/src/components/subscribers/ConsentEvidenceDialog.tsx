import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { subscribersAPI } from "@/services/api";

interface ConsentEvidenceDialogProps {
  subscriberId: string | null;
  onClose: () => void;
}

const csvCell = (value: unknown): string =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function ConsentEvidenceDialog({
  subscriberId,
  onClose,
}: ConsentEvidenceDialogProps) {
  const [evidence, setEvidence] = useState<Awaited<
    ReturnType<typeof subscribersAPI.getConsentEvidence>
  > | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subscriberId) {
      setEvidence(null);
      return;
    }
    setLoading(true);
    subscribersAPI
      .getConsentEvidence(subscriberId)
      .then(setEvidence)
      .finally(() => setLoading(false));
  }, [subscriberId]);

  const downloadCsv = () => {
    if (!evidence) return;
    const rows = [
      [
        "id",
        "email",
        "nome",
        "cognome",
        "indirizzo",
        "status",
        "source",
        "data iscrizione",
        "tipo consenso",
        "concesso",
        "testo consenso",
        "IP",
        "user-agent",
        "data scelta",
      ],
      ...evidence.consents.map((consent) => [
        evidence.subscriber.id,
        evidence.subscriber.email,
        evidence.subscriber.firstName,
        evidence.subscriber.lastName,
        evidence.subscriber.address,
        evidence.subscriber.status,
        evidence.subscriber.source,
        evidence.subscriber.subscribedAt,
        consent.type,
        consent.granted ? "si" : "no",
        consent.text,
        consent.ipAddress,
        consent.userAgent,
        consent.createdAt,
      ]),
    ];
    const blob = new Blob(
      [rows.map((row) => row.map(csvCell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scheda-consenso-${evidence.subscriber.email}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={Boolean(subscriberId)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scheda consenso</DialogTitle>
          <DialogDescription>
            Dati anagrafici, fonte e storico delle scelte registrate.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : (
          evidence && (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-2 rounded border p-4">
                <dt>Email</dt>
                <dd>{evidence.subscriber.email}</dd>
                <dt>Nome</dt>
                <dd>
                  {evidence.subscriber.firstName ||
                    evidence.subscriber.name ||
                    "-"}
                </dd>
                <dt>Cognome</dt>
                <dd>{evidence.subscriber.lastName || "-"}</dd>
                <dt>Indirizzo</dt>
                <dd>{evidence.subscriber.address || "-"}</dd>
                <dt>Fonte</dt>
                <dd>{evidence.subscriber.source || "-"}</dd>
                <dt>Iscrizione</dt>
                <dd>
                  {new Date(evidence.subscriber.subscribedAt).toLocaleString(
                    "it-IT",
                  )}
                </dd>
              </dl>
              <div className="space-y-2">
                {evidence.consents.map((consent) => (
                  <div key={consent.id} className="rounded border p-3">
                    <strong>
                      {consent.type}:{" "}
                      {consent.granted ? "concesso" : "revocato"}
                    </strong>
                    <div>
                      Data:{" "}
                      {new Date(consent.createdAt).toLocaleString("it-IT")} ·
                      IP: {consent.ipAddress || "non disponibile"}
                    </div>
                    <div>Fonte: {consent.source || "-"}</div>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                      {consent.text || "Nessun testo archiviato"}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={downloadCsv}
                disabled={!evidence.consents.length}
              >
                <Download className="mr-2 h-4 w-4" /> Scarica scheda CSV
              </Button>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
