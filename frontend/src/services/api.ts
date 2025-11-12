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
