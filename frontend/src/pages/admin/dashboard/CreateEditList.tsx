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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { emailListsAPI } from "@/services/api";
import type { EmailList } from "@/types/email-list.types";
import toast from "react-hot-toast";

interface CreateEditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editList?: EmailList | null;
  onSuccess: () => void;
}

// ====================================================================================================== //
//                                          COMPONENTE
// ====================================================================================================== //

export default function CreateEditListDialog({
  open,
  onOpenChange,
  editList,
  onSuccess,
}: CreateEditListDialogProps) {
  const isEditMode = !!editList;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

  // PRE-POPOLA FORM SE EDIT MODE
  useEffect(() => {
    if (editList) {
      setName(editList.name);
      setDescription(editList.description || "");
      setIsPublic(editList.isPublic);
    } else {
      // RESET
      setName("");
      setDescription("");
      setIsPublic(true);
    }
    setErrors({});
  }, [editList, open]);

  // ====== VALIDAZIONI ====== //
  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string } = {};
    // NAME
    if (!name.trim()) {
      newErrors.name = "List name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "List name must be at least 3 characters";
    } else if (name.trim().length > 100) {
      newErrors.name = "List name must be less than 100 characters";
    }
    // DESCRIP
    if (description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ====== SUBMIT ====== //
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      };

      if (isEditMode && editList) {
        await emailListsAPI.updateEmailList(editList.id, payload);
        toast.success("Email list updated successfully");
      } else {
        await emailListsAPI.createEmailList(payload);
        toast.success("Email list created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} email list`;
      toast.error(message);
      console.error("Error saving list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ====================================================================================================== //
  // ====================================================================================================== //

  // ====================================================================================================== //
  //                                          RENDER
  // ====================================================================================================== //

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifica lista" : "Crea una nuova lista"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Aggiorna i dettagli della tua lista email"
              : "Crea una nuova lista per organizzare i tuoi iscritti"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome lista <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Iscritti alla newsletter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (Opzionale)</Label>
            <Textarea
              id="description"
              placeholder="Descrivi lo scopo di questa lista..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* IS PUBLIC CHECKBOX */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="isPublic"
              className="text-sm font-normal cursor-pointer"
            >
              Elenco pubblico (Gli utenti possono iscriversi)
            </Label>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancella
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Aggiornamento..."
                  : "Creazione..."
                : isEditMode
                ? "Aggiorna elenco"
                : "Crea elenco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
