import axios from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types/auth.types";
import type {
  CommentListResponse,
  CommentStatus,
  CommentFilters,
  CommentResponse,
  UpdateCommentRequest,
} from "../../../backend/src/types/comment.types";
import {
  CreatePostRequest,
  PostFilters,
  PostListResponse,
  PostResponse,
  UpdatePostRequest,
} from "../../../backend/src/types/post.types";
import {
  Campaign,
  CampaignListResponse,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignFilters,
} from "@/types/campaign.types";
import type {
  EmailList,
  EmailListDetail,
  CreateEmailListRequest,
  UpdateEmailListRequest,
  AddSubscribersToListRequest,
} from "@/types/email-list.types";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category.types";
import type {
  Game,
  GameFilters,
  GameListResponse,
  CreateGameRequest,
  UpdateGameRequest,
  LeaderboardResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from "@/types/game.types";

// URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// CREAZIONE ISTANZA AXIOS
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR PER AGGIUNGERE TOKEN ALLA RICHIESTA
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======================================================================================
//                                  AUTH API
// ======================================================================================

export const authAPI = {
  // LOGIN
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  // REGISTRAZIONE
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },
};
// ======================================================================================
// ======================================================================================

// ======================================================================================
//                                  POSTS API
// ======================================================================================

export const postsAPI = {
  // OTTIENI TUTTI I POST CON FILTRI
  getPosts: async (filters?: PostFilters): Promise<PostListResponse> => {
    const response = await api.get<{
      success: boolean;
      data: PostListResponse;
    }>("/posts", {
      params: filters,
    });
    return response.data.data;
  },

  // OTTIENI SINGOLO POST
  getPostById: async (id: string): Promise<PostResponse> => {
    const response = await api.get<{
      success: boolean;
      data: PostResponse;
    }>(`/posts/${id}`);
    return response.data.data;
  },

  // CREA POST
  createPost: async (data: CreatePostRequest): Promise<PostResponse> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: PostResponse;
    }>("/posts", data);
    return response.data.data;
  },

  // UPDATE POST
  updatePost: async (
    id: string,
    data: UpdatePostRequest
  ): Promise<PostResponse> => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: PostResponse;
    }>(`/posts/${id}`, data);
    return response.data.data;
  },

  // DELETE POST
  deletePost: async (id: string): Promise<void> =>
    await api.delete(`/posts/${id}`),

  // TOGGLE STATUS PER ADMIN
  toggleFeatured: async (id: string): Promise<PostResponse> => {
    const response = await api.patch<{
      success: boolean;
      data: PostResponse;
    }>(`/posts/${id}/featured`);
    return response.data.data;
  },
  // SLUG
  checkSlugAvailability: async (slug: string): Promise<boolean> => {
    try {
      const response = await api.get(`/posts/check-slug/${slug}`);
      return response.data.available;
    } catch (error) {
      return false;
    }
  },

  // OTTIENI POST PER SLUG
  getPostBySlug: async (slug: string): Promise<PostResponse> => {
    const response = await api.get<{
      success: boolean;
      data: PostResponse;
    }>(`/posts/slug/${slug}`);
    return response.data.data;
  },
};
// ======================================================================================
// ======================================================================================

// ======================================================================================
//                                  COMMENTS API
// ======================================================================================
export const commentsAPI = {
  // OTTIENI TUTTI I COMMENTI CON FILTRI
  getComments: async (
    filters?: CommentFilters
  ): Promise<CommentListResponse> => {
    const response = await api.get<CommentListResponse>("/comments", {
      params: filters,
    });
    return response.data;
  },

  // OTTIENI SINGOLO COMMENTO
  getCommentById: async (id: string): Promise<CommentResponse> => {
    const response = await api.get<{
      success: boolean;
      data: CommentResponse;
    }>(`/comments/${id}`);
    return response.data.data;
  },

  // AGGIORNA STATUS COMMENTO (approve/reject/spam)
  updateCommentStatus: async (
    id: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> => {
    const response = await api.patch<CommentResponse>(
      `/comments/${id}/status`,
      data
    );
    return response.data;
  },

  // ELIMINA COMMENTO
  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },

  // CONTA COMMENTI PER STATUS (per badge nel menu)
  getCommentsCount: async (status: CommentStatus): Promise<number> => {
    const response = await api.get<CommentListResponse>("/comments", {
      params: { status, limit: 1 },
    });
    return response.data.total || 0;
  },
};

// ======================================================================================
//                                  CAMPAIGNS API
// ======================================================================================
export const campaignsAPI = {
  // OTTIENI TUTTE LE CAMPAGNE CON FILTRI
  getCampaigns: async (
    filters?: CampaignFilters
  ): Promise<CampaignListResponse> => {
    const response = await api.get<{
      success: boolean;
      data: CampaignListResponse;
    }>("/campaigns", {
      params: filters,
    });

    return response.data.data;
  },

  // OTTIENI SINGOLA CAMPAGNA
  getCampaignById: async (id: string): Promise<Campaign> => {
    const response = await api.get<{
      success: boolean;
      data: Campaign;
    }>(`/campaigns/${id}`);
    return response.data.data;
  },

  // CREA CAMPAGNA
  createCampaign: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Campaign;
    }>("/campaigns", data);
    return response.data.data;
  },

  // UPDATE CAMPAGNA
  updateCampaign: async (
    id: string,
    data: UpdateCampaignRequest
  ): Promise<Campaign> => {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: Campaign;
    }>(`/campaigns/${id}`, data);
    return response.data.data;
  },

  // DELETE CAMPAGNA
  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  // INVIA CAMPAGNA (cambio status da DRAFT/SCHEDULED a SENDING)
  sendCampaign: async (id: string): Promise<Campaign> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Campaign;
    }>(`/campaigns/${id}/send`);
    return response.data.data;
  },

  // INVIA EMAIL DI TEST
  sendTestEmail: async (id: string, testEmail: string): Promise<void> => {
    await api.post(`/campaigns/${id}/test`, { testEmail });
  },

  // OTTIENI STATISTICHE CAMPAGNA (quante email inviate/aperte/cliccate)
  getCampaignStats: async (
    id: string
  ): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        failed: number;
      };
    }>(`/campaigns/${id}/stats`);
    return response.data.data;
  },

  // PREVIEW
  sendPreviewEmail: async (data: {
    toEmail: string;
    subject: string;
    content: string;
    fromName?: string;
  }) => {
    const response = await api.post("/campaigns/send-preview", data);
    return response.data;
  },
};
// ======================================================================================
// ======================================================================================

// ======================================================================================
//                                  LISTE EMAIL
// ======================================================================================
export const emailListsAPI = {
  // OTTIENI TUTTE LE LISTE
  getEmailLists: async (): Promise<EmailList[]> => {
    const response = await api.get<EmailList[]>("/email-lists");
    return response.data;
  },

  // OTTIENI SINGOLA LISTA CON SUBSCRIBERS
  getEmailListById: async (id: string): Promise<EmailListDetail> => {
    const response = await api.get<EmailListDetail>(`/email-lists/${id}`);
    return response.data;
  },

  // CREA LISTA
  createEmailList: async (data: CreateEmailListRequest): Promise<EmailList> => {
    const response = await api.post<EmailList>("/email-lists", data);
    return response.data;
  },

  // AGGIORNA LISTA
  updateEmailList: async (
    id: string,
    data: UpdateEmailListRequest
  ): Promise<EmailList> => {
    const response = await api.put<EmailList>(`/email-lists/${id}`, data);
    return response.data;
  },

  // ELIMINA LISTA
  deleteEmailList: async (id: string): Promise<void> => {
    await api.delete(`/email-lists/${id}`);
  },

  // AGGIUNGI SUBSCRIBERS A LISTA
  addSubscribersToList: async (
    listId: string,
    data: AddSubscribersToListRequest
  ): Promise<{ message: string; addedCount: number }> => {
    const response = await api.post<{ message: string; addedCount: number }>(
      `/email-lists/${listId}/subscribers`,
      data
    );
    return response.data;
  },

  // OTTIENI SUBSCRIBERS DI UNA LISTA
  getListSubscribers: async (
    listId: string
  ): Promise<
    {
      id: string;
      email: string;
      name: string | null;
      status: string;
      subscribedAt: string;
    }[]
  > => {
    const response = await api.get<
      {
        id: string;
        email: string;
        name: string | null;
        status: string;
        subscribedAt: string;
      }[]
    >(`/email-lists/${listId}/subscribers`);
    return response.data;
  },

  // RIMUOVI SUBSCRIBER DA LISTA
  removeSubscriberFromList: async (
    listId: string,
    subscriberId: string
  ): Promise<void> => {
    await api.delete(`/email-lists/${listId}/subscribers/${subscriberId}`);
  },
};

// ======================================================================================
// ======================================================================================

// ======================================================================================
//                                  SUBSCRIBERS API
// ======================================================================================
export const subscribersAPI = {
  // OTTIENI TUTTI I SUBSCRIBERS CON FILTRI
  getSubscribers: async (filters?: {
    status?: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "subscribedAt" | "email" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    subscribers: {
      id: string;
      email: string;
      name: string | null;
      status: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
      subscribedAt: string;
      source: string | null;
      createdAt: string;
      updatedAt: string;
    }[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    stats: {
      totalActive: number;
      totalUnsubscribed: number;
      totalBounced: number;
    };
  }> => {
    const response = await api.get("/subscribers", {
      params: filters,
    });
    return response.data;
  },

  // CREA SUB
  createSubscriber: async (data: {
    email: string;
    name?: string;
    source?: string;
  }): Promise<{
    success: boolean;
    message: string;
    subscriber: {
      id: string;
      email: string;
      name: string | null;
      status: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
      subscribedAt: string;
      source: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }> => {
    const response = await api.post("/subscribers", data);
    return response.data;
  },

  // ELIMINA SUB
  deleteSubscriber: async (id: string): Promise<void> => {
    await api.delete(`/subscribers/${id}`);
  },
};
// ======================================================================================
// ======================================================================================

// ======================================================================================
//                                  CATEGORIE API
// ======================================================================================
export const categoriesAPI = {
  // OTTIENI TUTTE LE CATEGORIE
  getCategories: async (includeInactive?: boolean): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories", {
      params: { includeInactive: includeInactive || undefined },
    });
    return response.data;
  },

  // OTTIENI SINGOLA CATEGORIA
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // CREA CATEGORIA
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      category: Category;
    }>("/categories", data);
    return response.data.category;
  },

  // AGGIORNA CATEGORIA
  updateCategory: async (
    id: string,
    data: UpdateCategoryRequest
  ): Promise<Category> => {
    const response = await api.put<{
      success: boolean;
      message: string;
      category: Category;
    }>(`/categories/${id}`, data);
    return response.data.category;
  },

  // ELIMINA CATEGORIA
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// ======================================================================================
//                                  GIOCHI API
// ======================================================================================
export const gamesAPI = {
  // OTTIENI TUTTI I GIOCHI CON FILTRI
  getGames: async (filters?: GameFilters): Promise<GameListResponse> => {
    const response = await api.get<{
      success: boolean;
      data: GameListResponse;
    }>("/games", { params: filters });
    return response.data.data;
  },

  // OTTIENI GIOCO PER SLUG
  getGameBySlug: async (slug: string): Promise<Game> => {
    const response = await api.get<{ success: boolean; data: Game }>(
      `/games/slug/${slug}`
    );
    return response.data.data;
  },

  // OTTIENI SINGOLO GIOCO (ADMIN)
  getGameById: async (id: string): Promise<Game> => {
    const response = await api.get<{ success: boolean; data: Game }>(
      `/games/${id}`
    );
    return response.data.data;
  },

  // CREA GIOCO
  createGame: async (data: CreateGameRequest): Promise<Game> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Game;
    }>("/games", data);
    return response.data.data;
  },

  // AGGIORNA GIOCO
  updateGame: async (id: string, data: UpdateGameRequest): Promise<Game> => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: Game;
    }>(`/games/${id}`, data);
    return response.data.data;
  },

  // ELIMINA GIOCO
  deleteGame: async (id: string): Promise<void> => {
    await api.delete(`/games/${id}`);
  },

  // INCREMENTA CONTATORE PARTITE
  trackPlay: async (slug: string): Promise<void> => {
    try {
      await api.post(`/games/${slug}/play`);
    } catch {
      // IL CONTATORE NON DEVE MAI BLOCCARE IL GIOCO
    }
  },
};
// ======================================================================================
// ======================================================================================

// ======================================================================================
//                                  CLASSIFICHE GIOCHI
// ======================================================================================
export const leaderboardAPI = {
  // TOP N DEL PERIODO CORRENTE
  getScores: async (
    slug: string,
    limit = 10
  ): Promise<LeaderboardResponse> => {
    const response = await api.get<{
      success: boolean;
      data: LeaderboardResponse;
    }>(`/games/${slug}/scores`, { params: { limit } });
    return response.data.data;
  },

  // INVIA IL PUNTEGGIO DI FINE PARTITA
  submitScore: async (
    slug: string,
    data: SubmitScoreRequest
  ): Promise<SubmitScoreResponse> => {
    const response = await api.post<{
      success: boolean;
      data: SubmitScoreResponse;
    }>(`/games/${slug}/scores`, data);
    return response.data.data;
  },

  // MODERAZIONE (ADMIN)
  deleteScore: async (id: string): Promise<void> => {
    await api.delete(`/games/scores/${id}`);
  },
};
// ======================================================================================
// ======================================================================================
