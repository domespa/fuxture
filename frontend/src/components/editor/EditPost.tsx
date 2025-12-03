import { TiptapEditor } from "./TiptapEditor";
import { postsAPI } from "@/services/api";
import type { PostFormData, FormErrors } from "@/types/form.types";
import {
  PostStatus,
  type UpdatePostRequest,
  type PostResponse,
} from "../../../../backend/src/types/post.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { localToUtc, utcToLocal } from "@/lib/datetime";
import { categoriesAPI } from "@/services/api";
import type { Category } from "@/types/category.types";

export const EditPost = () => {
  // PRENDIAMO IL POST DA MODIFICARE
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // STATI DI CARICAMENTO
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [, setOriginalPost] = useState<PostResponse | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // STATO FORM
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    images: [],
    status: "DRAFT" as PostStatus,
    scheduledAt: "",
    seoTitle: "",
    seoDescription: "",
    tags: [],
    categoryId: "",
  });

  // STATO PER CONFERMARE L'USCITA DAL POST  SENZA PERDERE I SALVATAGGI
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // REF per debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // CARICAMENTO POST DA MODIFICARE
  useEffect(() => {
    const fetchPost = async () => {
      // SE NON C'è L'ID
      if (!id) {
        setLoadError("ID post mancante");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const post = await postsAPI.getPostById(id);

        // PRENDIAMO IL POST ORIGINALE PER CONFRONTO
        setOriginalPost(post);

        // PRE FORM
        setFormData({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || "",
          featuredImage: post.featuredImage || "",
          images: post.images || [],
          status: post.status,
          scheduledAt: post.scheduledAt ? utcToLocal(post.scheduledAt) : "",
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          tags: post.tags || [],
          categoryId: post.categoryId || "",
        });

        setLoadError(null);
      } catch (error: unknown) {
        console.error("Errore caricamento post:", error);

        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { error?: string } };
          };
          setLoadError(
            axiosError.response?.data?.error || "Impossibile caricare il post"
          );
        } else {
          setLoadError("Impossibile caricare il post");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  //  FETCH CATEGORIE
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // CLEANUP debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ============================================================
  //                    HANDLER CAMPI
  // ============================================================

  const handleChange = (
    field: keyof PostFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // SEGNALIAMO MODIFICHE NON SALVATA
    setHasUnsavedChanges(true);
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContentChange = useCallback((html: string) => {
    // Cancella il timer precedente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      queueMicrotask(() => {
        setFormData((prev) => ({
          ...prev,
          content: html,
        }));
        setHasUnsavedChanges(true);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.content;
          return newErrors;
        });
      });
    }, 0);
  }, []);

  // TAG
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();

      if (formData.tags.length >= 10) {
        setErrors((prev) => ({ ...prev, tags: "Massimo 10 tag" }));
        return;
      }

      if (formData.tags.includes(tagInput.trim())) {
        setTagInput("");
        return;
      }

      handleChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Il titolo è obbligatorio";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Il contenuto è obbligatorio";
    }

    if (formData.status === "SCHEDULED" && !formData.scheduledAt) {
      newErrors.scheduledAt =
        "Data di pubblicazione obbligatoria per post programmati";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: UpdatePostRequest = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      if (formData.excerpt) postData.excerpt = formData.excerpt;
      if (formData.featuredImage)
        postData.featuredImage = formData.featuredImage;
      if (formData.images.length > 0) postData.images = formData.images;
      if (formData.seoTitle) postData.seoTitle = formData.seoTitle;
      if (formData.seoDescription)
        postData.seoDescription = formData.seoDescription;
      if (formData.tags.length > 0) postData.tags = formData.tags;
      if (formData.categoryId) postData.categoryId = formData.categoryId;
      if (formData.status === "SCHEDULED" && formData.scheduledAt) {
        postData.scheduledAt = localToUtc(formData.scheduledAt);
      }

      // AGGIORNIAMO
      await postsAPI.updatePost(id!, postData);

      console.log("Post aggiornato con successo");

      // RESET
      setHasUnsavedChanges(false);

      // REDIRECT
      navigate("/dashboard/posts");
    } catch (error: any) {
      console.error("Errore aggiornamento post:", error);

      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          general:
            error.response?.data?.error ||
            "Errore durante l'aggiornamento del post",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // GESTIONE USCITA
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      navigate("/dashboard/posts");
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigate("/dashboard/posts");
  };

  // ============================================================
  //                    RENDER
  // ============================================================
  // CARICAMENTO
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Caricamento post...</p>
        </div>
      </div>
    );
  }
  // ERRORE
  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {loadError}
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/dashboard/posts")}
        >
          ← Torna alla lista
        </Button>
      </div>
    );
  }

  // EVVAI
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Modifica Post</h1>
        <p className="text-gray-600 mt-2">
          Modifica il contenuto del tuo articolo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titolo *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Inserisci il titolo del post"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Slug Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug URL
          </label>
          <input
            type="text"
            value={formData.slug}
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            Lo slug non può essere modificato dopo la pubblicazione
          </p>
        </div>

        {/* Content Field con TiptapEditor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenuto *
          </label>
          <TiptapEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder="Scrivi il contenuto del tuo post..."
          />
          {errors.content && (
            <p className="text-sm text-red-600 mt-1">{errors.content}</p>
          )}
        </div>

        {/* Excerpt Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estratto
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleChange("excerpt", e.target.value)}
            placeholder="Breve descrizione del post (max 160 caratteri)"
            rows={3}
            maxLength={160}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.excerpt.length}/160 caratteri
          </p>
        </div>

        {/* Featured Image Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Immagine in Evidenza
          </label>
          <input
            type="url"
            value={formData.featuredImage}
            onChange={(e) => handleChange("featuredImage", e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL dell'immagine principale del post (opzionale)
          </p>

          {/* Preview dell'immagine */}
          {formData.featuredImage && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative w-full max-w-md border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={formData.featuredImage}
                  alt="Preview"
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector(".error-message")) {
                      const errorDiv = document.createElement("div");
                      errorDiv.className =
                        "error-message flex items-center justify-center h-48 bg-red-50 text-red-600 text-sm";
                      errorDiv.textContent = "⚠️ Immagine non valida";
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stato *
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              handleChange("status", e.target.value as PostStatus)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="DRAFT">Bozza</option>
            <option value="PUBLISHED">Pubblicato</option>
            <option value="SCHEDULED">Programmato</option>
          </select>
        </div>

        {/* Scheduled Date (solo se status = SCHEDULED) */}
        {formData.status === "SCHEDULED" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Ora Pubblicazione *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleChange("scheduledAt", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.scheduledAt && (
              <p className="text-sm text-red-600 mt-1">{errors.scheduledAt}</p>
            )}
          </div>
        )}

        {/* Tags Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Scrivi un tag e premi Invio (max 10)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.tags && (
            <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
          )}

          {/* Tag Chips */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORIA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Nessuna categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon && `${cat.icon} `}
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* SEO Section (Collapsible) */}
        <details className="border rounded-lg p-4">
          <summary className="font-medium text-gray-700 cursor-pointer">
            Ottimizzazione SEO (opzionale)
          </summary>

          <div className="mt-4 space-y-4">
            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo SEO
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => handleChange("seoTitle", e.target.value)}
                placeholder="Titolo ottimizzato per motori di ricerca"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione SEO
              </label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => handleChange("seoDescription", e.target.value)}
                placeholder="Descrizione per motori di ricerca (max 160 caratteri)"
                rows={2}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.seoDescription.length}/160 caratteri
              </p>
            </div>
          </div>
        </details>

        {/* Errore generale */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        </div>
      </form>

      {/* Dialog Conferma Uscita */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifiche non salvate</DialogTitle>
            <DialogDescription>
              Hai modifiche non salvate. Sei sicuro di voler uscire senza
              salvare?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continua a modificare
            </Button>
            <Button variant="destructive" onClick={confirmExit}>
              Esci senza salvare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
