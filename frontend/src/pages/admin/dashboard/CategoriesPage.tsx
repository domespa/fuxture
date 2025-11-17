import { useEffect, useState } from "react";
import { categoriesAPI } from "@/services/api";
import { Category } from "@/types/category.types";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import CategoryDialog from "@/components/categories/CategoryDialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Errore nel caricamento delle categorie");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // DELETE CATEGORIA
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"?`)) return;

    try {
      setDeleting(id);
      await categoriesAPI.deleteCategory(id);
      toast.success("Categoria eliminata con successo");
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(
        error.response?.data?.error ||
          "Errore nell'eliminazione della categoria"
      );
    } finally {
      setDeleting(null);
    }
  };

  // TOGGLE ACTIVE
  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesAPI.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      toast.success(
        category.isActive ? "Categoria nascosta" : "Categoria attivata"
      );
      fetchCategories();
    } catch (error) {
      console.error("Error toggling category:", error);
      toast.error("Errore nell'aggiornamento della categoria");
    }
  };

  // FORMAT DATE
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">Caricamento categorie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorie Post</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le categorie dei tuoi articoli
          </p>
        </div>

        {/* BOTTONE CREA */}
        <Button
          onClick={() => {
            setEditingCategory(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuova Categoria
        </Button>
      </div>

      {/* TABELLA CATEGORIE */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrizione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articoli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creata il
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nessuna categoria trovata. Crea la tua prima categoria!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* COLOR DOT */}
                        {category.color && (
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {/* ICON */}
                        {category.icon && (
                          <span className="text-xl">{category.icon}</span>
                        )}
                        {/* NAME */}
                        <span className="text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {category._count?.posts || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          category.isActive
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {category.isActive ? "Attiva" : "Nascosta"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* TOGGLE ACTIVE BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(category)}
                          title={
                            category.isActive
                              ? "Nascondi categoria"
                              : "Attiva categoria"
                          }
                        >
                          {category.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        {/* EDIT BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setDialogOpen(true);
                          }}
                          title="Modifica categoria"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {/* DELETE BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                          disabled={deleting === category.id}
                          className="text-red-600 hover:text-red-700"
                          title="Elimina categoria"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editCategory={editingCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
