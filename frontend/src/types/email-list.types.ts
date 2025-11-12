// TIPI EMAIL
export interface EmailList {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailListDetail extends EmailList {
  subscribers: {
    id: string;
    email: string;
    name: string | null;
    subscribedAt: string;
  }[];
}

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
