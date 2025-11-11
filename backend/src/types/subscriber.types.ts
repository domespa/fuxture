import type { Subscriber } from "../generated/prisma";
import type { $Enums } from "../generated/prisma";

export type SubscriberStatus = $Enums.SubscriberStatus;

export interface CreateSubscriberRequest {
  email: string;
  name?: string;
  source?: string;
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
