import { CampaignStatus } from "../generated/prisma";

// TIPI PER RICHIESTE
export interface CreateCampaignRequest {
  subject: string;
  content: string;
  fromName?: string;
  status?: CampaignStatus;
  scheduledAt?: string;
}
export interface UpdateCampaignRequest {
  subject?: string;
  content?: string;
  fromName?: string;
  status?: CampaignStatus;
  scheduledAt?: string;
}

// TIPI PER I FILTRI
export interface CampaignFilters {
  status?: CampaignStatus | string;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
  sentAfter?: string;
  sentBefore?: string;
  creatorId?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// TIPI DI RISPOSTA
export interface CampaignResponse {
  id: string;
  subject: string;
  content: string;
  fromName: string | null;
  status: CampaignStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  emailStats: {
    totalSent: number;
    totalFailed: number;
  };
}

export interface CampaignListResponse {
  campaigns: CampaignResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
