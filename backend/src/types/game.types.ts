import type { GameStatus, GameType } from "@prisma/client";

export interface CreateGameRequest {
  title: string;
  slug?: string;
  description?: string;
  instructions?: string;
  coverImage?: string;
  type?: GameType;
  entryPath?: string;
  status?: GameStatus;
  isFeatured?: boolean;
  order?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string | null;
}

export interface UpdateGameRequest {
  title?: string;
  slug?: string;
  description?: string;
  instructions?: string;
  coverImage?: string;
  type?: GameType;
  entryPath?: string;
  status?: GameStatus;
  isFeatured?: boolean;
  order?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string | null;
}

export interface GameResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  coverImage: string | null;
  type: GameType;
  entryPath: string | null;
  status: GameStatus;
  isFeatured: boolean;
  order: number;
  plays: number;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface GameFilters {
  status?: GameStatus;
  categoryId?: string;
  search?: string;
  isFeatured?: boolean | string;
  page?: string;
  limit?: string;
  sortBy?: "order" | "plays" | "createdAt" | "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface GameListResponse {
  games: GameResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
