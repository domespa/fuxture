import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  PostListResponse,
  PostStatus,
} from "../types/post.types";
import { generateUniqueSlug, isSlugValid } from "../utils/slug.utils";

// ====================================================================================================== //
//                                   HELPER: GENERA EXCERPT
// ====================================================================================================== //
function generateExcerpt(content: string, maxLength: number = 160): string {
  const stripped = content.replace(/<[^>]*>/g, "");
  if (stripped.length <= maxLength) {
    return stripped;
  }
  return stripped.substring(0, maxLength).trim() + "...";
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   CREA POST
// ====================================================================================================== //
export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const data: CreatePostRequest = req.body;
    const authorId = req.user!.userId;
    const { categoryId } = data;

    // 1. GESTIONE SLUG
    let slug: string;

    if (data.slug) {
      const available = await isSlugValid(data.slug);
      if (!available) {
        res.status(400).json({
          error: "Slug already in use",
          suggestion:
            "Remove slug field to auto-generate, or choose a different slug",
        });
        return;
      }
      slug = data.slug;
    } else {
      // GENERIAMO SLUG DAL TITOLO
      slug = await generateUniqueSlug(data.title);
    }

    // GENERA EXCERPT SEO SE MANCANO
    const excerpt = data.excerpt || generateExcerpt(data.content);
    const seoTitle = data.seoTitle || data.title;
    const seoDescription = data.seoDescription || excerpt;

    // GESTIONE STATO
    let publishedAt: Date | null = null;
    if (data.status === PostStatus.PUBLISHED) {
      publishedAt = new Date();
    }

    // CREA IL POST
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt,
        featuredImage: data.featuredImage || null,
        images: data.images || [],
        status: data.status,
        publishedAt,
        scheduledAt: data.scheduledAt || null,
        seoTitle,
        seoDescription,
        tags: data.tags || [],
        authorId,
        categoryId: categoryId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   OTTIENI I POST CON I FILTRI
// ====================================================================================================== //
export async function getPosts(req: Request, res: Response): Promise<void> {
  try {
    const filters: PostFilters = req.query;
    const page = Math.max(1, parseInt(filters.page as any) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(filters.limit as any) || 10)
    );
    const skip = (page - 1) * limit;

    // ORDINE
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";
    const where: any = {};

    // FILTRO STATUS
    if (filters.status) {
      where.status = filters.status;
    } else {
      // OSPITE SOLO PUBLISHED
      if (!req.user || req.user.role !== "ADMIN") {
        where.status = PostStatus.PUBLISHED;
      }
    }

    // FILTRO CATEGORIA
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // FILTRO TAGS
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    // FILTRO FEATURED
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured === "true";
    }

    // FILTRO AUTHOR
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    // SEARCH in title/content
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // QUERY
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const response: PostListResponse = {
      posts: posts as any,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    OTTIENI SINGOLO POST
// ====================================================================================================== //
export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // NON PUBLISHED VEDE SOLO ADMIN
    if (post.status !== PostStatus.PUBLISHED) {
      if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    // INCREMENTA VIEWS
    if (post.status === PostStatus.PUBLISHED) {
      if (!req.user || req.user.userId !== post.authorId) {
        await prisma.post.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   AGGIORNA POST
// ====================================================================================================== //
export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data: UpdatePostRequest = req.body;

    // ESISTE?
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // PREPARIAMO I DATI PER AGGIORNARLO
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.featuredImage !== undefined)
      updateData.featuredImage = data.featuredImage;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined)
      updateData.seoDescription = data.seoDescription;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isFeatured !== undefined) {
      updateData.isFeatured = data.isFeatured;
      updateData.featuredAt = data.isFeatured ? new Date() : null;
    }
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    // SLUG
    if (data.slug !== undefined && data.slug !== existingPost.slug) {
      const available = await isSlugValid(data.slug, id);
      if (!available) {
        res.status(400).json({ error: "Slug already in use" });
        return;
      }
      updateData.slug = data.slug;
    }

    // STATUS
    if (data.status !== undefined) {
      updateData.status = data.status;

      if (
        data.status === PostStatus.PUBLISHED &&
        existingPost.status !== PostStatus.PUBLISHED
      ) {
        updateData.publishedAt = new Date();
      }

      if (data.status === PostStatus.SCHEDULED) {
        updateData.scheduledAt = data.scheduledAt;
      }
    }

    // UPDATE
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   DELETE POST
// ====================================================================================================== //
export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   OTTIENI POST PER SLUG
// ====================================================================================================== //
export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post non trovato",
      });
    }

    // INCREMENTIAMO VIEWS
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: {
        ...post,
        views: post.views + 1,
      },
    });
  } catch (error) {
    console.error("Errore nel recupero del post per slug:", error);
    res.status(500).json({
      success: false,
      message: "Errore nel recupero del post",
    });
  }
};
