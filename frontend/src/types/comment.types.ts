// Copia dei tipi di backend/src/types/comment.types.ts: vedi la nota in
// post.types.ts. I due file vanno tenuti allineati a mano.

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
  // Presente solo nelle risposte agli amministratori: l'endpoint pubblico
  // non restituisce piu' l'indirizzo di chi commenta
  authorEmail?: string;
  status: CommentStatus;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentResponse[];
  // Titolo e slug dell'articolo: servono a mostrare i commenti fuori dalla
  // pagina dell'articolo, per esempio in home
  post?: { title: string; slug: string };
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
