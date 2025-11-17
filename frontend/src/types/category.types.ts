export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

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
