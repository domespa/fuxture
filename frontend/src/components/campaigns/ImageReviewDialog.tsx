import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

// ============================================================================
// ESAME DELLE IMMAGINI NON CLASSIFICATE
//
// Il server riconosce i pixel da un elenco di host e da pattern noti, ma il
// Garante stesso rileva che i marcatori non hanno una sintassi standard. Le
// immagini remote che non sembrano ne' pixel ne' file grafici arrivano qui, e
// l'admin decide. Quelle indicate come pixel vengono tolte, all'invio, a chi
// ha revocato il consenso al tracciamento.
//
// Tutte partono spuntate: nel dubbio togliere un'immagine a chi ha revocato
// costa un elemento grafico, lasciarla costa una violazione.
//
// Le immagini non vengono mostrate in anteprima di proposito: caricarle dal
// browser dell'admin farebbe scattare proprio i pixel che si stanno esaminando.
// ============================================================================

interface ImageReviewDialogProps {
  open: boolean;
  images: string[];
  sending: boolean;
  onCancel: () => void;
  onConfirm: (trackingSources: string[]) => void;
}

export default function ImageReviewDialog({
  open,
  images,
  sending,
  onCancel,
  onConfirm,
}: ImageReviewDialogProps) {
  const [tracking, setTracking] = useState<Set<string>>(new Set(images));

  useEffect(() => {
    if (open) setTracking(new Set(images));
  }, [open, images]);

  const toggle = (src: string) =>
    setTracking((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Immagini da classificare
          </DialogTitle>
          <DialogDescription>
            Queste immagini esterne non sono riconosciute né come pixel di
            tracciamento né come file grafici. Lascia spuntate quelle che
            sono pixel: verranno rimosse dai messaggi destinati a chi ha
            disattivato il tracciamento. Togli la spunta solo alle immagini
            che fanno parte della grafica.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {images.map((src) => (
            <label
              key={src}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={tracking.has(src)}
                onChange={() => toggle(src)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {tracking.has(src) ? "Pixel di tracciamento" : "Immagine grafica"}
                </span>
                <span className="block break-all font-mono text-xs text-gray-500">
                  {src}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onCancel} disabled={sending}>
            Annulla
          </Button>
          <Button
            onClick={() => onConfirm(Array.from(tracking))}
            disabled={sending}
          >
            {sending ? "Invio in corso..." : "Conferma e invia"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
