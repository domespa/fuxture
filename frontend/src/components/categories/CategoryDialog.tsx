import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoriesAPI } from "@/services/api";
import type { Category } from "@/types/category.types";
import toast from "react-hot-toast";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: Category | null;
  onSuccess: () => void;
}

export default function CategoryDialog({
  open,
  onOpenChange,
  editCategory,
  onSuccess,
}: CategoryDialogProps) {
  const isEditMode = !!editCategory;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    color?: string;
  }>({});

  // PRE-POPOLA FORM SE EDIT MODE
  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setSlug(editCategory.slug);
      setDescription(editCategory.description || "");
      setColor(editCategory.color || "#3B82F6");
      setIcon(editCategory.icon || "");
      setOrder(editCategory.order);
    } else {
      // RESET
      setName("");
      setSlug("");
      setDescription("");
      setColor("#3B82F6");
      setIcon("");
      setOrder(0);
    }
    setErrors({});
  }, [editCategory, open]);

  // VALIDAZIONE
  const validate = (): boolean => {
    const newErrors: { name?: string; slug?: string; color?: string } = {};

    // NAME
    if (!name.trim()) {
      newErrors.name = "Nome obbligatorio";
    } else if (name.trim().length < 2) {
      newErrors.name = "Nome deve essere almeno 2 caratteri";
    } else if (name.trim().length > 100) {
      newErrors.name = "Nome deve essere massimo 100 caratteri";
    }

    // SLUG (se fornito)
    if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      newErrors.slug = "Slug non valido (usa solo a-z, 0-9, -)";
    }

    // COLOR (se fornito)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      newErrors.color = "Colore deve essere formato hex (#RRGGBB)";
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
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        color: color || undefined,
        icon: icon.trim() || undefined,
        order: order || 0,
      };

      if (isEditMode && editCategory) {
        await categoriesAPI.updateCategory(editCategory.id, payload);
        toast.success("Categoria aggiornata con successo");
      } else {
        await categoriesAPI.createCategory(payload);
        toast.success("Categoria creata con successo");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        `Errore ${isEditMode ? "aggiornamento" : "creazione"} categoria`;
      toast.error(message);
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifica Categoria" : "Crea Nuova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Aggiorna i dettagli della categoria"
              : "Crea una nuova categoria per organizzare i tuoi articoli"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome Categoria <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="es. Assicurazioni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* SLUG */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug{" "}
              <span className="text-gray-500 text-xs">
                (opzionale, auto-generato se vuoto)
              </span>
            </Label>
            <Input
              id="slug"
              placeholder="es. assicurazioni"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              disabled={isSubmitting}
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (Opzionale)</Label>
            <Textarea
              id="description"
              placeholder="Breve descrizione della categoria..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* COLOR + ICON ROW */}
          <div className="grid grid-cols-2 gap-4">
            {/* COLOR */}
            <div className="space-y-2">
              <Label htmlFor="color">Colore</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isSubmitting}
                  className="w-16 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color}</p>
              )}
            </div>

            {/* ICON (emoji) */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icona (Emoji)</Label>
              <Input
                id="icon"
                placeholder="es. 🛡️"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                disabled={isSubmitting}
                maxLength={4}
              />
            </div>
          </div>

          {/* ORDER */}
          <div className="space-y-2">
            <Label htmlFor="order">Ordine</Label>
            <Input
              id="order"
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Numero più basso = appare prima
            </p>
          </div>

          {/* PREVIEW */}
          {(color || icon) && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <Label>Preview</Label>
              <div className="flex items-center gap-3">
                {color && (
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                )}
                {icon && <span className="text-xl">{icon}</span>}
                <span className="font-medium">{name || "Nome Categoria"}</span>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Aggiornamento..."
                  : "Creazione..."
                : isEditMode
                ? "Aggiorna Categoria"
                : "Crea Categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
