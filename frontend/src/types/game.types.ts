export type GameType = "INTERNAL" | "EMBED";
export type GameStatus = "DRAFT" | "PUBLISHED";

export interface Game {
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
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface GameListResponse {
  games: Game[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GameFilters {
  status?: GameStatus;
  categoryId?: string;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "order" | "plays" | "createdAt" | "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
}

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

export type UpdateGameRequest = Partial<CreateGameRequest>;
