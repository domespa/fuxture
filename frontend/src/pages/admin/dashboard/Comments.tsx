import { useState, useEffect } from "react";
import { commentsAPI } from "@/services/api";
import {
  CommentResponse,
  CommentStatus,
  CommentFilters,
} from "../../../../../backend/src/types/comment.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Comments() {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setTotalComments] = useState(0);
  const [filters, setFilters] = useState<CommentFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    PENDING: 0,
    APPROVED: 0,
    SPAM: 0,
    REJECTED: 0,
  });

  // FETCH COMMENTI
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentsAPI.getComments(filters);
      setComments(response.comments);
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev,
      });

      if (!filters.status) {
        setTotalComments(response.total);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Errore nel caricamento dei commenti");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      // Totale generale
      const allResponse = await commentsAPI.getComments({ limit: 1 });

      // Conteggi per status
      const pendingResponse = await commentsAPI.getComments({
        status: CommentStatus.PENDING,
        limit: 1,
      });
      const approvedResponse = await commentsAPI.getComments({
        status: CommentStatus.APPROVED,
        limit: 1,
      });
      const spamResponse = await commentsAPI.getComments({
        status: CommentStatus.SPAM,
        limit: 1,
      });
      const rejectedResponse = await commentsAPI.getComments({
        status: CommentStatus.REJECTED,
        limit: 1,
      });

      setStatusCounts({
        all: allResponse.total,
        PENDING: pendingResponse.total,
        APPROVED: approvedResponse.total,
        SPAM: spamResponse.total,
        REJECTED: rejectedResponse.total,
      });
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  // CARICA COMMENTI AL MOUNT E QUANDO CAMBIANO I FILTRI
  useEffect(() => {
    fetchComments();
    fetchStatusCounts();
  }, [filters]);

  // CAMBIA STATUS
  const handleStatusChange = async (
    commentId: string,
    newStatus: CommentStatus
  ) => {
    try {
      await commentsAPI.updateCommentStatus(commentId, { status: newStatus });
      toast.success(`Commento ${newStatus.toLowerCase()}`);
      fetchComments();
      fetchStatusCounts();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Errore nell'aggiornamento dello status");
    }
  };

  // ELIMINA COMMENTO
  const handleDelete = async (commentId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;

    try {
      await commentsAPI.deleteComment(commentId);
      toast.success("Commento eliminato");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Errore nell'eliminazione del commento");
    }
  };

  // CAMBIA TAB (filtro per status)
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters({
      ...filters,
      status: value === "ALL" ? undefined : (value as CommentStatus),
      page: 1,
    });
  };

  // CERCA
  const handleSearch = () => {
    setFilters({
      ...filters,
      search: searchQuery || undefined,
      page: 1,
    });
  };

  // BADGE STATUS COLORATO
  const getStatusBadge = (status: CommentStatus) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      SPAM: "bg-red-100 text-red-800",
      REJECTED: "bg-gray-100 text-gray-800",
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Gestione Commenti</h1>
        <p className="text-gray-600 mt-2">
          Modera i commenti pubblicati sui tuoi post
        </p>
      </div>

      {/* FILTRI */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* TABS STATUS */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="ALL">Tutti ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="PENDING">
              In attesa ({statusCounts.PENDING})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              Approvati ({statusCounts.APPROVED})
            </TabsTrigger>
            <TabsTrigger value="SPAM">Spam ({statusCounts.SPAM})</TabsTrigger>
            <TabsTrigger value="REJECTED">
              Rifiutati ({statusCounts.REJECTED})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* SEARCH BAR */}
        <div className="flex gap-2">
          <Input
            placeholder="Cerca per autore o contenuto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>Cerca</Button>
        </div>
      </div>

      {/* TABELLA COMMENTI */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Caricamento...</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessun commento trovato
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Autore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    {/* AUTORE */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {comment.authorName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {comment.authorEmail}
                        </div>
                      </div>
                    </td>

                    {/* CONTENUTO */}
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {comment.content}
                      </p>
                    </td>

                    {/* STATUS BADGE */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          comment.status
                        )}`}
                      >
                        {comment.status}
                      </span>
                    </td>

                    {/* DATA */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("it-IT")}
                    </td>

                    {/* AZIONI */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* APPROVA */}
                        {comment.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(
                                comment.id,
                                CommentStatus.APPROVED
                              )
                            }
                            title="Approva"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}

                        {/* RIFIUTA */}
                        {comment.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(
                                comment.id,
                                CommentStatus.REJECTED
                              )
                            }
                            title="Rifiuta"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        )}

                        {/* SPAM */}
                        {comment.status !== "SPAM" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(comment.id, CommentStatus.SPAM)
                            }
                            title="Marca come Spam"
                          >
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          </Button>
                        )}

                        {/* ELIMINA */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(comment.id)}
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINAZIONE */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <Button
              disabled={!pagination.hasPrev}
              onClick={() =>
                setFilters({ ...filters, page: (filters.page as number) - 1 })
              }
            >
              Precedente
            </Button>
            <span className="text-sm text-gray-600">
              Pagina {filters.page} di {pagination.totalPages}
            </span>
            <Button
              disabled={!pagination.hasNext}
              onClick={() =>
                setFilters({ ...filters, page: (filters.page as number) + 1 })
              }
            >
              Successiva
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
