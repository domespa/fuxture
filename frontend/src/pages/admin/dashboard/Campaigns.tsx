import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { campaignsAPI } from "@/services/api";
import {
  Campaign,
  CampaignStatus,
  CampaignFilters,
} from "@/types/campaign.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Send,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { utcToLocal } from "@/lib/datetime";

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  // FILTRI E PAGINAZIONE
  const [filters, setFilters] = useState<CampaignFilters>({
    status: "ALL",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // FETCH CAMPAGNE
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getCampaigns(filters);

      setCampaigns(response.campaigns);
      setPagination({
        total: response.pagination.total,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        hasNext: response.pagination.hasNext,
        hasPrev: response.pagination.hasPrev,
      });
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Errore nel caricamento delle campagne");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  // CAMBIA TAB STATUS
  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as CampaignStatus | "ALL",
      page: 1,
    }));
  };

  // SEARCH
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  // PAGINAZIONE
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // DELETE CAMPAGNA
  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa campagna?")) return;

    try {
      setDeleting(id);
      await campaignsAPI.deleteCampaign(id);
      toast.success("Campagna eliminata con successo");
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Errore nell'eliminazione della campagna");
    } finally {
      setDeleting(null);
    }
  };

  // INVIA CAMPAGNA
  const handleSend = async (id: string) => {
    if (
      !confirm(
        "Sei sicuro di voler inviare questa campagna a tutti i subscriber?"
      )
    )
      return;

    try {
      setSending(id);
      await campaignsAPI.sendCampaign(id);
      toast.success("Campagna in invio!");
      fetchCampaigns();
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast.error("Errore nell'invio della campagna");
    } finally {
      setSending(null);
    }
  };

  // STATUS BADGE
  const getStatusBadge = (status: CampaignStatus) => {
    const statusConfig = {
      DRAFT: { label: "Bozza", className: "bg-gray-200 text-gray-800" },
      SCHEDULED: {
        label: "Programmata",
        className: "bg-blue-200 text-blue-800",
      },
      SENDING: {
        label: "In invio",
        className: "bg-yellow-200 text-yellow-800",
      },
      SENT: { label: "Inviata", className: "bg-green-200 text-green-800" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // FORMAT DATA
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const localDate = utcToLocal(dateString);
    const [datePart, timePart] = localDate.split("T");
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year} ${timePart}`;
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">Caricamento campagne...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER - MODIFICATO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagne Email</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le tue campagne di email marketing
          </p>
        </div>

        {/* BOTTONI - MODIFICATO */}
        <div className="flex gap-3">
          {/* PW*/}
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/campaigns/send-preview")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Invia per Approvazione
          </Button>

          {/* NUONA CAMPAGNA */}
          <Button onClick={() => navigate("/dashboard/campaigns/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Campagna
          </Button>
        </div>
      </div>

      {/* FILTRI */}
      <div className="space-y-4">
        {/* TABS STATUS */}
        <Tabs value={filters.status} onValueChange={handleStatusChange}>
          <TabsList>
            <TabsTrigger value="ALL">Tutte ({pagination.total})</TabsTrigger>
            <TabsTrigger value={CampaignStatus.DRAFT}>Bozze</TabsTrigger>
            <TabsTrigger value={CampaignStatus.SCHEDULED}>
              Programmate
            </TabsTrigger>
            <TabsTrigger value={CampaignStatus.SENT}>Inviate</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* SEARCH BAR */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca per oggetto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Cerca
          </Button>
        </div>
      </div>

      {/* TABELLA CAMPAGNE */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oggetto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programmata per
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inviata il
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
              {campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nessuna campagna trovata
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(campaign.scheduledAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(campaign.sentAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* SEND BUTTON */}
                        {(campaign.status === CampaignStatus.DRAFT ||
                          campaign.status === CampaignStatus.SCHEDULED) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSend(campaign.id)}
                            disabled={sending === campaign.id}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        {/* EDIT BUTTON */}
                        {campaign.status !== CampaignStatus.SENT &&
                          campaign.status !== CampaignStatus.SENDING && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/dashboard/campaigns/edit/${campaign.id}`
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}

                        {/* DELETE BUTTON */}
                        {campaign.status === CampaignStatus.DRAFT && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(campaign.id)}
                            disabled={deleting === campaign.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINAZIONE */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Pagina {pagination.page} di {pagination.totalPages} (
            {pagination.total} campagne totali)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Successiva
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
