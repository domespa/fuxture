// ====================================================================================================== //
//                                              ENUM
// ====================================================================================================== //
export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
}
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                              TIPI PER LE RICHIESTE
// ====================================================================================================== //
// TIPO PER CREARE POST
export interface CreatePostRequest {
  title: string;
  content: string;
  status: PostStatus;

  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  images?: string[];
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  scheduledAt?: Date;
  categoryId?: string;
}

// TIPO PER AGGIORNARE POST ESISTENTE
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  status?: PostStatus;
  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  images?: string[];
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  scheduledAt?: Date;
  isFeatured?: boolean;
  categoryId?: string;
}

// TIPO PER CERCARE IL POST
export interface PostFilters {
  status?: PostStatus;
  tags?: string[];
  search?: string;
  isFeatured?: boolean | string;
  authorId?: string;
  categoryId?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: "createdAt" | "publishedAt" | "views" | "title";
  sortOrder?: "asc" | "desc";
}
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                              TIPI PER LE RISPOSTE
// ====================================================================================================== //
// TIPO DI RISPOSTA SINGOLO POST
export interface PostResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  images: string[];
  status: PostStatus;
  isFeatured: boolean;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  tags: string[];
  views: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId?: string;
}

// TIPO ER LISTA POST IMPAGINATI
export interface PostListResponse {
  posts: PostResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
