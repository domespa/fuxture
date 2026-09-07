import type { Subscriber } from "@prisma/client";
import type { $Enums } from "@prisma/client";

export type SubscriberStatus = $Enums.SubscriberStatus;

export interface CreateSubscriberRequest {
  email: string;
  name?: string;
  source?: string;
  // TESTO ESATTO DEL CONSENSO ACCETTATO: serve a dimostrare a quale
  // formulazione l'interessato abbia prestato il consenso (art. 7 par. 1 GDPR)
  consentText?: string;
}

// CENTRO PREFERENZE: revoca granulare ex par. 6 delle Linee Guida del
// Garante del 17/04/2026 in materia di tracking pixel
export interface UpdatePreferencesRequest {
  trackingConsent?: boolean;
  subscribed?: boolean;
}

export interface PreferencesResponse {
  email: string;
  name: string | null;
  subscribed: boolean;
  trackingConsent: boolean;
  subscribedAt: Date;
}

export interface UpdateSubscriberRequest {
  name?: string;
  status?: SubscriberStatus;
  metadata?: Record<string, unknown>;
}

export interface SubscriberResponse {
  id: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriberFilters {
  status?: SubscriberStatus;
  source?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: "subscribedAt" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface SubscriberListResponse {
  subscribers: SubscriberResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: {
    totalActive: number;
    totalUnsubscribed: number;
    totalBounced: number;
  };
}

export interface UnsubscribeRequest {
  email: string;
  token?: string;
}

export interface SubscriberActionResponse {
  success: boolean;
  message: string;
  subscriber?: SubscriberResponse;
}
