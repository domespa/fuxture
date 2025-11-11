import type { PostStatus } from "../../../backend/src/types/post.types";

// FORM
export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  images: string[];
  status: PostStatus;
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

// ERRORI
export interface FormErrors {
  [key: string]: string;
}
