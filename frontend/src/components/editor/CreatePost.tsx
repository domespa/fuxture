import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { postsAPI } from "@/services/api";
import type { PostFormData, FormErrors } from "@/types/form.types";
import {
  PostStatus,
  type CreatePostRequest,
} from "../../../../backend/src/types/post.types";
import { localToUtc } from "@/lib/datetime";

export const CreatePost = () => {
  const navigate = useNavigate();

  // STATO DEL POST
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
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // PULIAMO AL UNMPUNT
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // HANDLER PER CAMBIARE I CAMPI
  const handleChange = (
    field: keyof PostFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // RIMUOVIAMO ERRORE QUANDO USER MODIFICA IL CMAPO
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // GENERA SLUG
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    handleChange("slug", slug);

    if (slug) {
      checkSlugAvailability(slug);
    }
  };

  // VERIFICHIAMO DISPONIBILITA SLUG
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setIsCheckingSlug(true);
    setSlugAvailable(null);

    try {
      const available = await postsAPI.checkSlugAvailability(slug);
      setSlugAvailable(available);

      if (!available) {
        setErrors((prev) => ({
          ...prev,
          slug: "Questo slug è già in uso. Prova con uno diverso.",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.slug;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Errore verifica slug:", error);
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // DEBOUNCE
  const handleSlugChange = (value: string) => {
    handleChange("slug", value);

    // Cancella timeout precedente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Aspetta 500ms dopo che user smette di scrivere
    timeoutRef.current = setTimeout(() => {
      if (value) {
        checkSlugAvailability(value);
      }
    }, 500);
  };

  // TAG
  //AGGIUNGI
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();

      // MASSIMO 10
      if (formData.tags.length >= 10) {
        setErrors((prev) => ({ ...prev, tags: "Massimo 10 tag" }));
        return;
      }

      // CHECK DUSPLICATI
      if (formData.tags.includes(tagInput.trim())) {
        setTagInput("");
        return;
      }

      handleChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // RIMUOVI
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

    // ERRORE? FERMATI
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: CreatePostRequest = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      // Aggiungi campi opzionali solo se compilati
      if (formData.slug) postData.slug = formData.slug;
      if (formData.excerpt) postData.excerpt = formData.excerpt;
      if (formData.featuredImage)
        postData.featuredImage = formData.featuredImage;
      if (formData.images.length > 0) postData.images = formData.images;
      if (formData.seoTitle) postData.seoTitle = formData.seoTitle;
      if (formData.seoDescription)
        postData.seoDescription = formData.seoDescription;
      if (formData.tags.length > 0) postData.tags = formData.tags;
      if (formData.scheduledAt)
        postData.scheduledAt = localToUtc(formData.scheduledAt);

      // Chiamata API
      const response = await postsAPI.createPost(postData);

      console.log("Post creato:", response);

      // Redirect alla lista post
      navigate("/dashboard/posts");
    } catch (error: any) {
      console.error("Errore creazione post:", error);

      // Gestisci errori dal backend
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            "Errore durante la creazione del post",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crea Nuovo Post</h1>
        <p className="text-gray-600 mt-2">
          Compila i campi per creare un nuovo articolo per il blog
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
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="url-del-post (lascia vuoto per auto-generare)"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  slugAvailable === false
                    ? "border-red-300"
                    : slugAvailable === true
                    ? "border-green-300"
                    : "border-gray-300"
                }`}
              />

              {/* Indicator di disponibilità */}
              {isCheckingSlug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}

              {!isCheckingSlug && slugAvailable === true && formData.slug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                  ✓
                </div>
              )}

              {!isCheckingSlug && slugAvailable === false && formData.slug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                  ✗
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={generateSlug}
              disabled={!formData.title || isCheckingSlug}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Genera
            </button>
          </div>

          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
          )}

          {slugAvailable === true && formData.slug && (
            <p className="text-sm text-green-600 mt-1">✓ Slug disponibile!</p>
          )}

          {formData.slug && (
            <p className="text-sm text-gray-500 mt-1">
              URL: /blog/{formData.slug}
            </p>
          )}
        </div>

        {/* Content Field con TiptapEditor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenuto *
          </label>
          <TiptapEditor
            content={formData.content}
            onChange={(html) => handleChange("content", html)}
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
            onClick={() => navigate("/dashboard/posts")}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Salvataggio..." : "Crea Post"}
          </button>
        </div>
      </form>
    </div>
  );
};
