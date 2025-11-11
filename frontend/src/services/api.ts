import axios from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types/auth.types";
import type {
  CommentListResponse,
  CommentStatus,
} from "../../../backend/src/types/comment.types";
import {
  CreatePostRequest,
  PostFilters,
  PostListResponse,
  PostResponse,
  UpdatePostRequest,
} from "../../../backend/src/types/post.types";

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
//                                  COMMENTS API PER BADGE
// ======================================================================================
export const commentsAPI = {
  // PRENDIAMO PER STATUS
  getCommentsCount: async (status: CommentStatus): Promise<number> => {
    const response = await api.get<CommentListResponse>(`/comments`, {
      params: { status, limit: 1 },
    });
    return response.data.total || 0;
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
