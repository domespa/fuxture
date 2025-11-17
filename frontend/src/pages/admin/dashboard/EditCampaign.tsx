import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { campaignsAPI } from "@/services/api";
import {
  Campaign,
  CampaignFormData,
  CampaignStatus,
} from "@/types/campaign.types";
import { localToUtc } from "@/lib/datetime";
import axios from "axios";
import type { UpdateCampaignRequest } from "@/types/campaign.types";

// ====================================================================================================== //
//                                          COMPONENTE
// ====================================================================================================== //
export const EditCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================================================================ //
  //                           FETCH CAMPAGNA
  // ================================================================ //
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        toast.error("ID campagna mancante");
        navigate("/dashboard/campaigns");
        return;
      }

      try {
        setIsLoading(true);
        const data = await campaignsAPI.getCampaignById(id);
        setCampaign(data);
        if (
          data.status === CampaignStatus.SENT ||
          data.status === CampaignStatus.SENDING
        ) {
          toast.error(
            "Non puoi modificare una campagna già inviata o in invio"
          );
          navigate("/dashboard/campaigns");
        }
      } catch (error) {
        console.error("Errore fetch campagna:", error);
        toast.error("Errore nel caricamento della campagna");
        navigate("/dashboard/campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id, navigate]);
  // ================================================================ //
  // ================================================================ //

  // ================================================================ //
  //                           SUBMIT & CANCEL
  // ================================================================ //
  const handleSubmit = async (formData: CampaignFormData) => {
    if (!id) return;

    setIsSubmitting(true);

    try {
      const payload: UpdateCampaignRequest = {
        subject: formData.subject,
        content: formData.content,
        status: formData.status,
      };

      if (formData.fromName && formData.fromName.trim() !== "") {
        payload.fromName = formData.fromName;
      }

      if (
        formData.status === CampaignStatus.SCHEDULED &&
        formData.scheduledAt
      ) {
        payload.scheduledAt = localToUtc(formData.scheduledAt).toISOString();
      } else if (formData.status === CampaignStatus.DRAFT) {
        payload.scheduledAt = null;
      }

      await campaignsAPI.updateCampaign(id, payload);

      toast.success("Campagna aggiornata con successo!");
      navigate("/dashboard/campaigns");
    } catch (error) {
      console.error("Errore aggiornamento campagna:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Status:", error.response?.status);
      }

      toast.error("Errore durante l'aggiornamento della campagna");
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
  //                           LOADING
  // ================================================================ //
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Caricamento campagna...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Campagna non trovata</p>
        </div>
      </div>
    );
  }

  // ================================================================ //
  //                            RENDER
  // ================================================================ //
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Modifica Campagna</h1>
        <p className="text-muted-foreground">
          Modifica la campagna "{campaign.subject}"
        </p>
      </div>

      {/* Form */}
      <CampaignForm
        initialData={campaign}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        onCancel={handleCancel}
        mode="edit"
      />
    </div>
  );
};
