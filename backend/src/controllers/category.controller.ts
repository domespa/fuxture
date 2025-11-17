import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { Category, Prisma } from "../generated/prisma";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
  CategoryFilters,
} from "../types/category.types";
import { generateSlug } from "../utils/slug.utils";

// ====================================================================================================== //
//                                       HEPER: CATEGORY TO CATRES
// ====================================================================================================== //
const toCategoryResponse = (
  category: Category & { _count?: { posts: number } }
): CategoryResponse => {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    color: category.color,
    icon: category.icon,
    order: category.order,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    _count: category._count,
  };
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI TUTTE - PUBBLICO
// ====================================================================================================== //

// GET /categories
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { includeInactive }: CategoryFilters = req.query;

    const where: Prisma.CategoryWhereInput = {};

    // DI DEF SOLO ATTIVE
    if (includeInactive !== "true" && includeInactive !== true) {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { order: "asc" },
    });

    res.status(200).json(categories.map(toCategoryResponse));
  } catch (error) {
    console.error("Errore recupero categories:", error);
    res.status(500).json({ error: "Errore durante recupero categorie" });
  }
};

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI SINGOLA - PUBBLICO
// ====================================================================================================== //

// GET /categories/:id
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      res.status(404).json({ error: "Categoria non trovata" });
      return;
    }

    res.status(200).json(toCategoryResponse(category));
  } catch (error) {
    console.error("Errore recupero category:", error);
    res.status(500).json({ error: "Errore durante recupero categoria" });
  }
};

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: CREA - ADMIN
// ====================================================================================================== //

// POST /categories (ADMIN)
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      color,
      icon,
      order,
    }: CreateCategoryRequest = req.body;

    const finalSlug = slug || generateSlug(name);

    const existingSlug = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      res.status(409).json({ error: "Slug già esistente" });
      return;
    }

    const existingName = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingName) {
      res.status(409).json({ error: "Nome categoria già esistente" });
      return;
    }

    // CREA
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        color: color || null,
        icon: icon || null,
        order: order || 0,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Categoria creata con successo",
      category: toCategoryResponse(category),
    });
  } catch (error) {
    console.error("Errore creazione category:", error);
    res.status(500).json({ error: "Errore durante creazione categoria" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: AGGIORN - ADMIN
// ====================================================================================================== //

// PUT /categories/:id
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      color,
      icon,
      order,
      isActive,
    }: UpdateCategoryRequest = req.body;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Categoria non trovata" });
      return;
    }

    if (slug && slug !== existing.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug },
      });
      if (duplicateSlug) {
        res.status(409).json({ error: "Slug già esistente" });
        return;
      }
    }

    if (name && name.trim() !== existing.name) {
      const duplicateName = await prisma.category.findUnique({
        where: { name: name.trim() },
      });
      if (duplicateName) {
        res.status(409).json({ error: "Nome categoria già esistente" });
        return;
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined)
      updateData.description = description.trim() || null;
    if (color !== undefined) updateData.color = color || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update
    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Categoria aggiornata con successo",
      category: toCategoryResponse(updated),
    });
  } catch (error) {
    console.error("Errore update category:", error);
    res.status(500).json({ error: "Errore durante aggiornamento categoria" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: ELIMINA - ADMIN
// ====================================================================================================== //
// DELETE /categories/:id
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Categoria non trovata" });
      return;
    }

    if (existing._count.posts > 0) {
      res.status(400).json({
        error: `Impossibile eliminare categoria con ${existing._count.posts} post associati. Rimuovi prima i post o cambia categoria.`,
      });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Categoria eliminata con successo",
    });
  } catch (error) {
    console.error("Errore eliminazione category:", error);
    res.status(500).json({ error: "Errore durante eliminazione categoria" });
  }
};
