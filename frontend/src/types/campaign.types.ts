export enum CampaignStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  SENDING = "SENDING",
  SENT = "SENT",
}

// TYPE
export interface Campaign {
  id: string;
  subject: string;
  content: string;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  emailsSent?: number;
  emailsDelivered?: number;
  emailsOpened?: number;
  emailsClicked?: number;
}

// REQUEST TYPE
export interface CreateCampaignRequest {
  subject: string;
  content: string;
  status: CampaignStatus;
  scheduledAt?: string;
}

// REQUEST TYPE
export interface UpdateCampaignRequest {
  subject?: string;
  content?: string;
  status?: CampaignStatus;
  scheduledAt?: string | null;
}

// RESPONSE TYPE
export interface CampaignListResponse {
  campaigns: Campaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// FILTERS
export interface CampaignFilters {
  status?: CampaignStatus | "ALL";
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "sentAt" | "subject";
  sortOrder?: "asc" | "desc";
  search?: string;
}
