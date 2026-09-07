// ============================================================================
// RUBRICA E CRONOLOGIA INVII
// ============================================================================

// Indirizzo usato in un invio manuale. Non e' un iscritto alla newsletter:
// la rubrica serve solo a non riscrivere ogni volta lo stesso destinatario,
// e nessuna campagna puo' selezionare da qui.
export interface Contact {
  id: string;
  email: string;
  name: string | null;
  note: string | null;
  timesUsed: number;
  firstUsedAt: string;
  lastUsedAt: string;
}

export type EmailLogStatus =
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "BOUNCED"
  | "FAILED";

export interface EmailLogEntry {
  id: string;
  status: EmailLogStatus;
  sentAt: string;
  errorMessage: string | null;
  recipientEmail: string | null;
  subject: string | null;
  campaignId: string | null;
  origin: "campagna" | "manuale";
}

export interface EmailLogPage {
  logs: EmailLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EmailLogSummary {
  total: number;
  failed: number;
  lastSentAt: string | null;
}
