// TIPI PER RICHIESTA
export interface CreateEmailListRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateEmailListRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddSubscribersToListRequest {
  subscriberIds: string[];
}

// TIPI PER RISPOSTA
export interface EmailListResponse {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailListDetailResponse extends EmailListResponse {
  subscribers: {
    id: string;
    email: string;
    name: string | null;
    subscribedAt: Date;
  }[];
}
