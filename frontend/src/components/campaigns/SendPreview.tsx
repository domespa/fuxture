import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { Code, Eye } from "lucide-react";
import { campaignsAPI } from "@/services/api";

export const SendPreview = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "preview">("html");

  const [formData, setFormData] = useState({
    fromName: "Fuxture",
    subject: "",
    toEmail: "",
    content: `<p style="text-align: center;">Se non visualizzi correttamente questo messaggio <a href="{{web_version_url}}" target="_blank">guarda la versione web</a></p>

<hr>

<p style="text-align: center;">Questa email ti è stata inviata dal titolare del trattamento Spampinato Domenico, Carlentini 96013 P.IVA IT01937400891 <a href="mailto:info@fuxture.net">info@fuxture.net</a> perchè hai partecipato ad una delle nostre iniziative o perchè sei iscritto a Fuxture.<br>
Il messaggio è stato inviato alla tua email in ottemperanza al GDPR Reg. UE 679/06. Per cancellarti, clicca sul seguente <a href="{{unsubscribe_url}}">link</a>. Puoi prendere visione dell'informativa privacy cliccando <a href="https://fuxture.net/privacy-policy/">qui</a>.<br><p>Lancio su</p>
<p>Per esito e modifiche PW scrivere a <a href="mailto:dumiii1988@gmail.com">Dumiii1988@gmail.com</a></p></p>`,
  });

  const validateForm = (): boolean => {
    if (!formData.subject || formData.subject.trim().length < 3) {
      toast.error("L'oggetto deve contenere almeno 3 caratteri");
      return false;
    }

    if (!formData.toEmail || !formData.toEmail.includes("@")) {
      toast.error("Inserisci un indirizzo email valido per il destinatario");
      return false;
    }

    if (!formData.content || formData.content.trim().length === 0) {
      toast.error("Il contenuto non può essere vuoto");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await campaignsAPI.sendPreviewEmail({
        toEmail: formData.toEmail,
        subject: formData.subject,
        content: formData.content,
        fromName: formData.fromName,
      });

      toast.success(`Email inviata con successo a ${formData.toEmail}!`);
      navigate("/dashboard/campaigns");
    } catch (error) {
      console.error("Errore invio preview:", error);
      toast.error("Errore durante l'invio dell'email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/campaigns");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Invia Email per Approvazione
        </h1>
        <p className="text-muted-foreground">
          Invia una preview della campagna all'affiliazione per ottenere
          l'approvazione
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-4xl">
        {/* From Name */}
        <div className="space-y-2">
          <Label htmlFor="fromName">Nome mittente</Label>
          <Input
            id="fromName"
            type="text"
            placeholder="Fuxture"
            value={formData.fromName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fromName: e.target.value }))
            }
            disabled={isSubmitting}
          />
          <p className="text-sm text-muted-foreground">
            Se vuoto, verrà usato "Fuxture"
          </p>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Oggetto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            type="text"
            placeholder="Es: Newsletter di Gennaio 2025"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            maxLength={200}
            disabled={isSubmitting}
          />
          <p className="text-sm text-muted-foreground">
            {formData.subject.length}/200 caratteri
          </p>
        </div>

        {/* Destinatario */}
        <div className="space-y-2">
          <Label htmlFor="toEmail">
            Destinatario (Email Affiliazione){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="toEmail"
            type="email"
            placeholder="affiliazione@example.com"
            value={formData.toEmail}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, toEmail: e.target.value }))
            }
            disabled={isSubmitting}
          />
          <p className="text-sm text-muted-foreground">
            L'email sarà inviata a questo indirizzo per l'approvazione della
            campagna
          </p>
        </div>

        {/* Content: HTML + Anteprima */}
        <div className="space-y-2">
          <Label>
            Contenuto <span className="text-red-500">*</span>
          </Label>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "html" | "preview")}
          >
            <TabsList>
              <TabsTrigger value="html">
                <Code className="h-4 w-4 mr-2" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </TabsTrigger>
            </TabsList>

            {/* Tab HTML */}
            <TabsContent value="html" className="border rounded-lg bg-white">
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full h-[500px] p-4 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg resize-none"
                placeholder="Incolla qui il tuo HTML completo..."
                disabled={isSubmitting}
              />
            </TabsContent>

            {/* Tab Anteprima */}
            <TabsContent
              value="preview"
              className="border rounded-lg bg-white overflow-hidden"
            >
              <div className="w-full h-[600px]">
                <iframe
                  srcDoc={formData.content}
                  className="w-full h-full border-0"
                  title="Email Preview"
                  sandbox="allow-same-origin allow-popups"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Invio in corso..." : "Invia Email"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
        </div>
      </div>
    </div>
  );
};
