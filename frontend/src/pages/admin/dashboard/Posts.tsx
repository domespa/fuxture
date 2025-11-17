import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postsAPI } from "@/services/api";
import toast from "react-hot-toast";
import {
  PostResponse,
  PostFilters,
  PostStatus,
} from "../../../../../backend/src/types/post.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Posts() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // STATI PER IMPAGINAZION
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // STATO FILTRI
  const [filters, setFilters] = useState<PostFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // STATO PER DIALOG
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    postId: string | null;
    postTitle: string;
  }>({
    open: false,
    postId: null,
    postTitle: "",
  });

  const navigate = useNavigate();

  // FETCH DEI POST QUANDO CAMBIA IL FILTRO
  useEffect(() => {
    fetchPosts();
  }, [filters]);

  // FUNZIONE PER CARICARE I POST
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Filters:", filters);
      console.log("🔍 postsAPI:", postsAPI);
      const response = await postsAPI.getPosts(filters);
      console.log("✅ Response ricevuta:", response);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error("Errore fetch posts:", err);
      setError(
        err.response?.data?.message || "Errore nel caricamento dei post"
      );
      toast.error("Impossibile caricare i post");
    } finally {
      setLoading(false);
    }
  };

  // FUNZIONE PER CAMBIARE I FILTRI
  const handleFilterChange = (key: keyof PostFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  // FUNZIONE SEARCH -> METTEREMO IL DEBOUNCE
  const handleSearch = (value: string) => {
    handleFilterChange("search", value || undefined);
  };

  // FUNZIONE TOGGLEF
  const handleToggleFeatured = async (postId: string) => {
    try {
      const updatedPost = await postsAPI.toggleFeatured(postId);

      // AGGIORNIAMO SENZA RIFARE IL FETCH
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isFeatured: updatedPost.isFeatured }
            : post
        )
      );

      toast.success(
        updatedPost.isFeatured
          ? "Post aggiunto ai featured"
          : "Post rimosso dai featured"
      );
    } catch (err: any) {
      console.error("Errore toggle featured:", err);
      toast.error("Errore nell'aggiornamento del post");
    }
  };

  // FUNZIONE PER APRIRE DIALOG
  const openDeleteDialog = (post: PostResponse) => {
    setDeleteDialog({
      open: true,
      postId: post.id,
      postTitle: post.title,
    });
  };

  // PER CONFERMARE DELETE
  const handleDelete = async () => {
    if (!deleteDialog.postId) return;

    try {
      await postsAPI.deletePost(deleteDialog.postId);

      setPosts((prev) =>
        prev.filter((post) => post.id !== deleteDialog.postId)
      );

      toast.success("Post eliminato con successo");
      setDeleteDialog({ open: false, postId: null, postTitle: "" });
    } catch (err: any) {
      console.error("Errore eliminazione post:", err);
      toast.error("Errore nell'eliminazione del post");
    }
  };

  // HANDLER PER PAGINAZIONE
  const handlePageChange = (newPage: number) => {
    handleFilterChange("page", newPage);
  };
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestione Post</h1>
          <p className="text-muted-foreground mt-1">
            Totale: {pagination?.total ?? 0} post
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/posts/create")}>
          + Nuovo Post
        </Button>
      </div>

      {/* FILTRI */}
      <div className="flex gap-4 items-end flex-wrap">
        {/* SEARCH */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Cerca</label>
          <Input
            placeholder="Cerca per titolo..."
            value={(filters.search as string) || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* STATUS FILTER */}
        <div className="w-[180px]">
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "ALL" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutti gli status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tutti</SelectItem>
              <SelectItem value={PostStatus.PUBLISHED}>Pubblicati</SelectItem>
              <SelectItem value={PostStatus.DRAFT}>Bozze</SelectItem>
              <SelectItem value={PostStatus.SCHEDULED}>Programmati</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* FEATURED FILTER */}
        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="featured"
            checked={filters.isFeatured === true}
            onCheckedChange={(checked) =>
              handleFilterChange("isFeatured", checked ? true : undefined)
            }
          />
          <label
            htmlFor="featured"
            className="text-sm font-medium cursor-pointer"
          >
            Solo Featured
          </label>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Caricamento post...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && posts?.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Nessun post trovato</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/dashboard/posts/create")}
          >
            Crea il primo post
          </Button>
        </div>
      )}

      {!loading && !error && posts && posts.length > 0 && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    {/* TITOLO */}
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-muted-foreground truncate mt-1">
                          {post.excerpt}
                        </div>
                      )}
                    </TableCell>

                    {/* STATUS BADGE */}
                    <TableCell>
                      <Badge
                        variant={
                          post.status === PostStatus.PUBLISHED
                            ? "default"
                            : post.status === PostStatus.DRAFT
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {post.status}
                      </Badge>
                    </TableCell>

                    {/* FEATURED CHECKBOX */}
                    <TableCell>
                      <Checkbox
                        checked={post.isFeatured}
                        onCheckedChange={() => handleToggleFeatured(post.id)}
                      />
                    </TableCell>

                    {/* VIEWS */}
                    <TableCell>{post.views}</TableCell>

                    {/* DATA */}
                    <TableCell>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("it-IT")
                        : new Date(post.createdAt).toLocaleDateString("it-IT")}
                    </TableCell>

                    {/* AZIONI */}
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/dashboard/posts/edit/${post.id}`)
                        }
                      >
                        Modifica
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(post)}
                      >
                        Elimina
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Pagina {pagination.page} di {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  ← Precedente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Successiva →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, postId: null, postTitle: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare il post{" "}
              <span className="font-semibold text-foreground">
                "{deleteDialog.postTitle}"
              </span>
              ? Questa azione è irreversibile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, postId: null, postTitle: "" })
              }
            >
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
