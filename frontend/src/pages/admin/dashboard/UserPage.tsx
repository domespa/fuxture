import { useEffect, useState } from "react";
import {
  Mail,
  Search,
  Filter,
  UserPlus,
  Trash2,
  ListPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { subscribersAPI } from "@/services/api";
import SelectListDialog from "@/components/subscribers/SelectListDialog";
import AddSubscriberDialog from "@/components/subscribers/AddSubscriberDialog";
import DeleteSubscriberDialog from "@/components/subscribers/DeleteSubscriberDialog";
import toast from "react-hot-toast";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
  subscribedAt: string;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  // STATE
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

  // DIALOG STATE
  const [selectListDialogOpen, setSelectListDialogOpen] = useState(false);
  const [addSubscriberDialogOpen, setAddSubscriberDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // STATS
  const [stats, setStats] = useState({
    totalActive: 0,
    totalUnsubscribed: 0,
    totalBounced: 0,
  });

  // FETCH SUBSCRIBERS
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: 20,
        sortBy: "subscribedAt",
        sortOrder: "desc",
      };

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await subscribersAPI.getSubscribers(filters);

      setSubscribers(response.subscribers);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setStats(response.stats);
    } catch (error: any) {
      console.error("Errore fetch subscribers:", error);
      toast.error(error.response?.data?.error || "Errore caricamento iscritti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, statusFilter]);

  // SEARCH CON DEBOUNCE
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchSubscribers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // SELECT/DESELECT ALL
  const handleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map((s) => s.id));
    }
  };

  // TOGGLE SINGLE
  const handleToggleSubscriber = (id: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // APRI DIALOG ADD TO LIST
  const handleAddToList = () => {
    if (selectedSubscribers.length === 0) {
      toast.error("Seleziona almeno un iscritto");
      return;
    }
    setSelectListDialogOpen(true);
  };

  // CALLBACK SUCCESS DIALOG
  const handleAddToListSuccess = () => {
    setSelectedSubscribers([]);
    fetchSubscribers();
  };

  // APRI DIALOG ADD SUBSCRIBER
  const handleOpenAddDialog = () => {
    setAddSubscriberDialogOpen(true);
  };

  // CALLBACK SUCCESS ADD
  const handleAddSuccess = () => {
    fetchSubscribers();
    setSelectedSubscribers([]);
  };

  // APRI DIALOG DELETE SINGOLO
  const handleOpenDeleteDialog = (subscriber: Subscriber) => {
    setSubscriberToDelete({
      id: subscriber.id,
      email: subscriber.email,
    });
    setDeleteDialogOpen(true);
  };

  // DELETE SINGOLO SUBSCRIBER
  const handleDeleteSingle = async () => {
    if (!subscriberToDelete) return;

    setIsDeleting(true);

    try {
      await subscribersAPI.deleteSubscriber(subscriberToDelete.id);
      toast.success("Iscritto eliminato con successo");
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
      fetchSubscribers();
    } catch (error: any) {
      console.error("Errore eliminazione:", error);
      toast.error(error.response?.data?.error || "Errore durante eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  // DELETE MULTIPLI SUBSCRIBERS
  const handleDeleteSelected = async () => {
    if (selectedSubscribers.length === 0) {
      toast.error("Seleziona almeno un iscritto");
      return;
    }

    if (
      !confirm(
        `Sei sicuro di voler eliminare ${selectedSubscribers.length} iscritti? Questa azione è irreversibile.`
      )
    ) {
      return;
    }

    const toastId = toast.loading(
      `Eliminazione di ${selectedSubscribers.length} iscritti...`
    );

    try {
      let deleted = 0;
      let failed = 0;

      // LOOP per eliminare ogni subscriber
      for (const subscriberId of selectedSubscribers) {
        try {
          await subscribersAPI.deleteSubscriber(subscriberId);
          deleted++;
        } catch (error) {
          console.error(`Failed to delete subscriber ${subscriberId}:`, error);
          failed++;
        }
      }

      if (failed === 0) {
        toast.success(`${deleted} iscritti eliminati con successo`, {
          id: toastId,
        });
      } else {
        toast.error(
          `${deleted} eliminati, ${failed} falliti. Riprova per quelli falliti.`,
          { id: toastId }
        );
      }

      // Resetta selezione e ricarica
      setSelectedSubscribers([]);
      fetchSubscribers();
    } catch (error: any) {
      console.error("Errore eliminazione:", error);
      toast.error("Errore durante eliminazione", { id: toastId });
    }
  };

  // STATUS BADGE
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "UNSUBSCRIBED":
        return (
          <Badge variant="secondary">
            <XCircle className="mr-1 h-3 w-3" />
            Unsubscribed
          </Badge>
        );
      case "BOUNCED":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Bounced
          </Badge>
        );
      default:
        return null;
    }
  };

  // FORMAT DATE
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Iscritti Newsletter</h1>
          <p className="text-gray-600 mt-1">
            Gestisci gli iscritti alla tua newsletter
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Aggiungi Iscritto
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Totali</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold">{total}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-600">Attivi</p>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.totalActive}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Disiscritti</p>
            <XCircle className="h-4 w-4 text-gray-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-600">
            {stats.totalUnsubscribed}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-600">Bounced</p>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats.totalBounced}
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          {/* SEARCH */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cerca per email o nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* STATUS FILTER */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtra per status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="ACTIVE">Attivi</SelectItem>
              <SelectItem value="UNSUBSCRIBED">Disiscritti</SelectItem>
              <SelectItem value="BOUNCED">Bounced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* BULK ACTIONS */}
        {selectedSubscribers.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddToList}>
              <ListPlus className="mr-2 h-4 w-4" />
              Aggiungi a Lista ({selectedSubscribers.length})
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina ({selectedSubscribers.length})
            </Button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    subscribers.length > 0 &&
                    selectedSubscribers.length === subscribers.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Iscritto il</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">Nessun iscritto trovato</p>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onCheckedChange={() =>
                        handleToggleSubscriber(subscriber.id)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {subscriber.email}
                  </TableCell>
                  <TableCell>{subscriber.name || "-"}</TableCell>
                  <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                  <TableCell>{formatDate(subscriber.subscribedAt)}</TableCell>
                  <TableCell>
                    {subscriber.source ? (
                      <Badge variant="outline">{subscriber.source}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleOpenDeleteDialog(subscriber)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Pagina {currentPage} di {totalPages} ({total} totali)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Precedente
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Successivo
            </Button>
          </div>
        </div>
      )}

      {/* DIALOGS */}
      <SelectListDialog
        open={selectListDialogOpen}
        onOpenChange={setSelectListDialogOpen}
        selectedSubscriberIds={selectedSubscribers}
        onSuccess={handleAddToListSuccess}
      />

      <AddSubscriberDialog
        open={addSubscriberDialogOpen}
        onOpenChange={setAddSubscriberDialogOpen}
        onSuccess={handleAddSuccess}
      />

      <DeleteSubscriberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        subscriberEmail={subscriberToDelete?.email || ""}
        onConfirm={handleDeleteSingle}
        isDeleting={isDeleting}
      />
    </div>
  );
}
