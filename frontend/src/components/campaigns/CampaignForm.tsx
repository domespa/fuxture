import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { getGDPRFooter } from "@/lib/emailTemplates";
import { utcToLocal } from "@/lib/datetime";
import { Code, Eye } from "lucide-react";
import {
  CampaignStatus,
  CampaignFormProps,
  CampaignFormData,
} from "@/types/campaign.types";

// ====================================================================================================== //
//                                          COMPONENTE
// ====================================================================================================== //

export const CampaignForm = ({
  initialData,
  onSubmit,
  isLoading,
  mode = "create",
  onCancel,
}: CampaignFormProps) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    subject: initialData?.subject || "",
    fromName: initialData?.fromName || "Fuxture",
    content: initialData?.content || "",
    status: initialData?.status || CampaignStatus.DRAFT,
    scheduledAt: initialData?.scheduledAt
      ? utcToLocal(initialData.scheduledAt)
      : "",
  });

  const [activeTab, setActiveTab] = useState<"html" | "preview">("html");

  // INIZIALIZZA CONTENT CON FOOTER GDPR
  useEffect(() => {
    if (!initialData && !formData.content) {
      setFormData((prev) => ({ ...prev, content: getGDPRFooter() }));
    }
  }, [initialData]);

  // ================================================================ //
  //                           VALIDAZIONI
  // ================================================================ //

  const validateForm = (): boolean => {
    // SUBJECT
    if (!formData.subject || formData.subject.trim().length < 3) {
      toast.error("L'oggetto deve contenere almeno 3 caratteri");
      return false;
    }
    if (formData.subject.length > 200) {
      toast.error("L'oggetto non può superare 200 caratteri");
      return false;
    }

    // CONTENT
    if (!formData.content || formData.content.trim().length === 0) {
      toast.error("Il contenuto non può essere vuoto");
      return false;
    }

    // SCHEDULED
    if (formData.status === CampaignStatus.SCHEDULED) {
      if (!formData.scheduledAt) {
        toast.error("Seleziona una data per la programmazione");
        return false;
      }

      const scheduledDate = new Date(formData.scheduledAt);
      const now = new Date();

      if (scheduledDate <= now) {
        toast.error("La data deve essere nel futuro");
        return false;
      }
    }

    return true;
  };

  // ================================================================ //
  //                            SUBMIT
  // ================================================================ //
  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(formData);
  };

  // ================================================================ //
  //                            BUTTON TEXT
  // ================================================================ //
  const getSubmitButtonText = (): string => {
    if (isLoading) {
      return "Salvataggio...";
    }

    if (mode === "edit") {
      return "Aggiorna Campagna";
    }

    if (formData.status === CampaignStatus.DRAFT) {
      return "Salva Bozza";
    }

    if (formData.status === CampaignStatus.SCHEDULED) {
      return "Programma Invio";
    }

    return "Salva";
  };

  // ================================================================ //
  //                            RENDER
  // ================================================================ //
  return (
    <div className="space-y-6 max-w-4xl">
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
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          {formData.subject.length}/200 caratteri
        </p>
      </div>

      {/* From Name */}
      <div className="space-y-2">
        <Label htmlFor="fromName">Nome mittente (opzionale)</Label>
        <Input
          id="fromName"
          type="text"
          placeholder="Fuxture"
          value={formData.fromName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fromName: e.target.value }))
          }
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Se vuoto, verrà usato "Fuxture"
        </p>
      </div>

      {/* Status Radio Group */}
      <div className="space-y-3">
        <Label>
          Stato <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.status}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              status: value as CampaignStatus,
            }))
          }
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={CampaignStatus.DRAFT} id="draft" />
            <Label htmlFor="draft" className="font-normal cursor-pointer">
              Salva come bozza
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={CampaignStatus.SCHEDULED} id="scheduled" />
            <Label htmlFor="scheduled" className="font-normal cursor-pointer">
              Programma invio
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Scheduled Date (condizionale) */}
      {formData.status === CampaignStatus.SCHEDULED && (
        <div className="space-y-2 pl-6 border-l-2 border-primary">
          <Label htmlFor="scheduledAt">
            Data e ora invio <span className="text-red-500">*</span>
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))
            }
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Seleziona quando vuoi inviare la campagna
          </p>
        </div>
      )}

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

          {/* Tab HTML Raw */}
          <TabsContent value="html" className="border rounded-lg bg-white">
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              className="w-full h-[500px] p-4 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg resize-none"
              placeholder="Incolla qui il tuo HTML completo..."
              disabled={isLoading}
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
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {getSubmitButtonText()}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annulla
        </Button>
      </div>
    </div>
  );
};
