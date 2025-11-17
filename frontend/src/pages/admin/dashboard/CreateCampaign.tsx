import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { campaignsAPI } from "@/services/api";
import { CampaignFormData, CampaignStatus } from "@/types/campaign.types";
import { localToUtc } from "@/lib/datetime";

// ====================================================================================================== //
//                                          COMPONENTE
// ====================================================================================================== //
export default function CreateCampaign() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================================================================ //
  //                           SUBMIT & CANCEL
  // ================================================================ //
  const handleSubmit = async (formData: CampaignFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        subject: formData.subject,
        fromName: formData.fromName || "Fuxture",
        content: formData.content,
        status: formData.status,
        ...(formData.status === CampaignStatus.SCHEDULED && {
          scheduledAt: localToUtc(formData.scheduledAt).toISOString(),
        }),
      };

      await campaignsAPI.createCampaign(payload);

      toast.success(
        status === "DRAFT"
          ? "Bozza salvata con successo!"
          : "Campagna programmata con successo!"
      );

      // TUTTO OK, REDIRECT
      navigate("/dashboard/campaigns");
    } catch (error) {
      console.error("Errore creazione campagna:", error);
      toast.error("Errore durante la creazione della campagna");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/campaigns");
  };
  // ================================================================ //
  // ================================================================ //

  // ================================================================ //
  //                           RENDER
  // ================================================================ //
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nuova Campagna Email</h1>
        <p className="text-muted-foreground">
          Crea una nuova campagna email per i tuoi iscritti
        </p>
      </div>

      {/* Form */}
      <CampaignForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        mode="create"
        onCancel={handleCancel}
      />
    </div>
  );
}
