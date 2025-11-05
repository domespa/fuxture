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
