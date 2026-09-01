import { useEffect, useState, type FormEvent } from "react";
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
import { gamesAPI, categoriesAPI } from "@/services/api";
import { REGISTRY_KEYS } from "@/components/games/registry";
import type {
  Game,
  GameStatus,
  GameType,
  LeaderboardPeriod,
} from "@/types/game.types";
import type { Category } from "@/types/category.types";
import toast from "react-hot-toast";

interface GameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGame?: Game | null;
  onSuccess: () => void;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export default function GameDialog({
  open,
  onOpenChange,
  editGame,
  onSuccess,
}: GameDialogProps) {
  const isEditMode = !!editGame;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [type, setType] = useState<GameType>("INTERNAL");
  const [entryPath, setEntryPath] = useState(REGISTRY_KEYS[0] || "");
  const [status, setStatus] = useState<GameStatus>("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardPeriod>("NONE");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    slug?: string;
    entryPath?: string;
  }>({});

  // CATEGORIE PER LA SELECT
  useEffect(() => {
    if (!open) return;

    categoriesAPI
      .getCategories(true)
      .then(setCategories)
      .catch((error) => console.error("Error fetching categories", error));
  }, [open]);

  // PRE-POPOLA IN EDIT MODE
  useEffect(() => {
    if (editGame) {
      setTitle(editGame.title);
      setSlug(editGame.slug);
      setDescription(editGame.description || "");
      setInstructions(editGame.instructions || "");
      setCoverImage(editGame.coverImage || "");
      setType(editGame.type);
      setEntryPath(editGame.entryPath || "");
      setStatus(editGame.status);
      setIsFeatured(editGame.isFeatured);
      setOrder(editGame.order);
      setTags(editGame.tags.join(", "));
      setCategoryId(editGame.categoryId || "");
      setSeoTitle(editGame.seoTitle || "");
      setSeoDescription(editGame.seoDescription || "");
      setLeaderboard(editGame.leaderboard);
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setInstructions("");
      setCoverImage("");
      setType("INTERNAL");
      setEntryPath(REGISTRY_KEYS[0] || "");
      setStatus("DRAFT");
      setIsFeatured(false);
      setOrder(0);
      setTags("");
      setCategoryId("");
      setSeoTitle("");
      setSeoDescription("");
      setLeaderboard("NONE");
    }
    setErrors({});
  }, [editGame, open]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Titolo obbligatorio";
    } else if (title.trim().length < 2 || title.trim().length > 120) {
      newErrors.title = "Titolo tra 2 e 120 caratteri";
    }

    if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      newErrors.slug = "Slug non valido (usa solo a-z, 0-9, -)";
    }

    if (!entryPath.trim()) {
      newErrors.entryPath =
        type === "INTERNAL"
          ? "Scegli il gioco dal registry"
          : "Indica il path della build (es. tetris/index.html)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        type,
        entryPath: entryPath.trim(),
        status,
        isFeatured,
        order: Number(order) || 0,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        categoryId: categoryId || null,
        leaderboard,
      };

      if (isEditMode && editGame) {
        await gamesAPI.updateGame(editGame.id, payload);
        toast.success("Gioco aggiornato con successo");
      } else {
        await gamesAPI.createGame(payload);
        toast.success("Gioco creato con successo");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error saving game:", error);
      toast.error("Errore nel salvataggio del gioco");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifica gioco" : "Nuovo gioco"}
          </DialogTitle>
          <DialogDescription>
            I giochi INTERNAL sono componenti React del progetto, quelli EMBED
            sono build statiche dentro public/embedded-games/.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TITOLO */}
          <div className="space-y-2">
            <Label htmlFor="game-title">Titolo *</Label>
            <Input
              id="game-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Parola del Giorno"
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* SLUG */}
          <div className="space-y-2">
            <Label htmlFor="game-slug">Slug</Label>
            <Input
              id="game-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="lascia vuoto per generarlo dal titolo"
            />
            {errors.slug && (
              <p className="text-xs text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* TIPO + ENTRY PATH */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="game-type">Tipo *</Label>
              <select
                id="game-type"
                className={SELECT_CLASS}
                value={type}
                onChange={(e) => {
                  const nextType = e.target.value as GameType;
                  setType(nextType);
                  setEntryPath(
                    nextType === "INTERNAL" ? REGISTRY_KEYS[0] || "" : ""
                  );
                }}
              >
                <option value="INTERNAL">INTERNAL (componente React)</option>
                <option value="EMBED">EMBED (build statica in iframe)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-entry">Entry path *</Label>
              {type === "INTERNAL" ? (
                <select
                  id="game-entry"
                  className={SELECT_CLASS}
                  value={entryPath}
                  onChange={(e) => setEntryPath(e.target.value)}
                >
                  <option value="">— seleziona —</option>
                  {REGISTRY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="game-entry"
                  value={entryPath}
                  onChange={(e) => setEntryPath(e.target.value)}
                  placeholder="tetris/index.html"
                />
              )}
              {errors.entryPath && (
                <p className="text-xs text-red-600">{errors.entryPath}</p>
              )}
            </div>
          </div>

          {/* DESCRIZIONE */}
          <div className="space-y-2">
            <Label htmlFor="game-description">Descrizione</Label>
            <Textarea
              id="game-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Indovina la parola di 5 lettere in 6 tentativi."
            />
          </div>

          {/* ISTRUZIONI */}
          <div className="space-y-2">
            <Label htmlFor="game-instructions">Come si gioca</Label>
            <Textarea
              id="game-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>

          {/* COVER */}
          <div className="space-y-2">
            <Label htmlFor="game-cover">URL immagine di copertina</Label>
            <Input
              id="game-cover"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* STATUS + CATEGORIA */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="game-status">Stato</Label>
              <select
                id="game-status"
                className={SELECT_CLASS}
                value={status}
                onChange={(e) => setStatus(e.target.value as GameStatus)}
              >
                <option value="DRAFT">Bozza</option>
                <option value="PUBLISHED">Pubblicato</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-category">Categoria</Label>
              <select
                id="game-category"
                className={SELECT_CLASS}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Nessuna</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CLASSIFICA */}
          <div className="space-y-2">
            <Label htmlFor="game-leaderboard">Classifica</Label>
            <select
              id="game-leaderboard"
              className={SELECT_CLASS}
              value={leaderboard}
              onChange={(e) =>
                setLeaderboard(e.target.value as LeaderboardPeriod)
              }
            >
              <option value="NONE">Nessuna</option>
              <option value="ALL_TIME">Record di sempre</option>
              <option value="DAILY">Giornaliera (si azzera ogni giorno)</option>
            </select>
            <p className="text-xs text-gray-500">
              Con la classifica attiva il gioco chiede un nickname prima della
              prima partita.
            </p>
          </div>

          {/* ORDINE + TAGS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="game-order">Ordine</Label>
              <Input
                id="game-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game-tags">Tag (separati da virgola)</Label>
              <Input
                id="game-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="parole, quiz, veloce"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-2">
            <Label htmlFor="game-seo-title">SEO title</Label>
            <Input
              id="game-seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Parola del Giorno: il Wordle italiano gratis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="game-seo-description">SEO description</Label>
            <Textarea
              id="game-seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* IN EVIDENZA */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Metti in evidenza
          </label>

          <DialogFooter>
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
                ? "Salvataggio..."
                : isEditMode
                  ? "Salva modifiche"
                  : "Crea gioco"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
