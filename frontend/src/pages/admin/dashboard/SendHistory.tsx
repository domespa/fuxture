import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emailLogsAPI } from "@/services/api";
import AddressBook from "@/components/mailing/AddressBook";
import type { EmailLogEntry, EmailLogSummary } from "@/types/mailing.types";
import toast from "react-hot-toast";

// ====================================================================================================== //
//        Cronologia degli invii: ogni messaggio uscito dal sistema, campagne e invii manuali.
//        Comprende i falliti, che sono i piu' utili da vedere: prima l'unico modo di accorgersi
//        di un errore SMTP era che il destinatario non ricevesse nulla.
// ====================================================================================================== //

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  OPENED: "bg-green-100 text-green-800",
  CLICKED: "bg-green-100 text-green-800",
  BOUNCED: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
};

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SendHistory() {
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [summary, setSummary] = useState<EmailLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyFailed, setOnlyFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await emailLogsAPI.getLogs({
        search: search.trim() || undefined,
        status: onlyFailed ? "FAILED" : undefined,
        page,
        limit: 25,
      });
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (error) {
      console.error("Errore caricamento cronologia:", error);
      toast.error("Errore nel caricamento della cronologia");
    } finally {
      setLoading(false);
    }
  }, [search, onlyFailed, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    emailLogsAPI.getSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cronologia invii</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ogni email uscita dal sistema: campagne, test e anteprime.
        </p>
      </div>

      {/* RIEPILOGO */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <span className="text-xs uppercase text-gray-500">Totale</span>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {summary.total.toLocaleString("it-IT")}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <span className="text-xs uppercase text-gray-500">Falliti</span>
            <p
              className={`mt-1 text-2xl font-bold ${
                summary.failed > 0 ? "text-red-600" : "text-gray-900"
              }`}
            >
              {summary.failed.toLocaleString("it-IT")}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <span className="text-xs uppercase text-gray-500">
              Ultimo invio
            </span>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {summary.lastSentAt
                ? formatDateTime(summary.lastSentAt)
                : "Mai"}
            </p>
          </div>
        </div>
      )}

      {/* FILTRI */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setPage(1);
            }}
            placeholder="Cerca per destinatario o oggetto..."
            className="pl-9"
          />
        </div>
        <Button
          variant={onlyFailed ? "default" : "outline"}
          onClick={() => {
            setOnlyFailed((v) => !v);
            setPage(1);
          }}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Solo falliti
        </Button>
      </div>

      {/* TABELLA */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Send className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              Nessun invio{search.trim() || onlyFailed ? " per questi filtri" : ""}.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-5 py-3">Destinatario</th>
                <th className="px-5 py-3">Oggetto</th>
                <th className="px-5 py-3">Origine</th>
                <th className="px-5 py-3">Stato</th>
                <th className="px-5 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {log.recipientEmail ?? (
                      <span className="text-gray-400">non registrato</span>
                    )}
                  </td>
                  <td className="max-w-xs px-5 py-3 text-gray-700">
                    <span className="block truncate">
                      {log.subject ?? "—"}
                    </span>
                    {log.errorMessage && (
                      <span className="mt-1 block text-xs text-red-600">
                        {log.errorMessage}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{log.origin}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        STATUS_STYLES[log.status] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                    {formatDateTime(log.sentAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINAZIONE */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Precedente
          </Button>
          <span className="text-sm text-gray-600">
            {page} di {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Successiva
          </Button>
        </div>
      )}

      <AddressBook />
    </div>
  );
}
