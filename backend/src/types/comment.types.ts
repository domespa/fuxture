import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

// ENUM STATO COMMENTI
export enum CommentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SPAM = "SPAM",
  REJECTED = "REJECTED",
}

// COMMENTO REQUEST E RESPONSE
export interface CreateCommentRequest {
  content: string;
  authorName: string;
  authorEmail: string;
  postId: string;
  parentId?: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  status: CommentStatus;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentResponse[];
}

// ADMIN - AGGIORNARE COMMENTO
export interface UpdateCommentRequest {
  content?: string;
  status?: CommentStatus;
}

// FILTRI
export interface CommentFilters {
  postId?: string;
  status?: CommentStatus;
  parentId?: string | null;
  search?: string;
  page?: number | string;
  limit?: number | string;
}

// LISTA COMMENTI RESPONSE
export interface CommentListResponse {
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
