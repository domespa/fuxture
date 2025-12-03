import type { Category } from "@prisma/client";

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    posts: number;
  };
}

export interface CategoryFilters {
  includeInactive?: boolean | string;
}
