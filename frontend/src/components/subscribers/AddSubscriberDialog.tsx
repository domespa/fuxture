import { getApiErrorMessage } from "@/lib/apiError";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribersAPI } from "@/services/api";
import toast from "react-hot-toast";

interface AddSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddSubscriberDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddSubscriberDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [consentText, setConsentText] = useState("");
  const [source, setSource] = useState("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
  }>({});

  // RESET FORM
  useEffect(() => {
    if (open) {
      setEmail("");
      setName("");
      setFirstName("");
      setLastName("");
      setAddress("");
      setConsentText("");
      setSource("admin");
      setErrors({});
    }
  }, [open]);

  // VALIDAZIONE
  const validate = (): boolean => {
    const newErrors: { email?: string; name?: string } = {};

    // EMAIL
    if (!email.trim()) {
      newErrors.email = "Email obbligatoria";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email non valida";
    }

    // NAME
    if (name.trim() && name.trim().length < 2) {
      newErrors.name = "Nome deve essere almeno 2 caratteri";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: {
        email: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        address?: string;
        source: string;
        consentText: string;
      } = {
        email: email.trim(),
        source: source,
        consentText: consentText.trim(),
      };

      if (name.trim()) {
        payload.name = name.trim();
      }
      if (firstName.trim()) payload.firstName = firstName.trim();
      if (lastName.trim()) payload.lastName = lastName.trim();
      if (address.trim()) payload.address = address.trim();

      await subscribersAPI.createSubscriber(payload);

      toast.success("Iscritto aggiunto con successo");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating subscriber:", error);
      toast.error(
        getApiErrorMessage(error, "Errore durante aggiunta iscritto"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Aggiungi Iscritto</DialogTitle>
          <DialogDescription>
            Aggiungi manualmente un nuovo iscritto alla newsletter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="esempio@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome (Opzionale)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Mario Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              placeholder="Cognome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input
              id="address"
              placeholder="Via, numero, città"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consentText">Prova del consenso *</Label>
            <textarea
              id="consentText"
              required
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              disabled={isSubmitting}
              className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Testo esatto del consenso prestato dall'interessato"
            />
          </div>

          {/* SOURCE (hidden, auto-set to "admin") */}
          <input type="hidden" value={source} />

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Aggiunta in corso..." : "Aggiungi Iscritto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
