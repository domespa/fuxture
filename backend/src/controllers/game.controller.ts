import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { Game, Category, Prisma } from "@prisma/client";
import type {
  CreateGameRequest,
  UpdateGameRequest,
  GameResponse,
  GameFilters,
} from "../types/game.types";
import { generateSlug } from "../utils/slug.utils";

// ====================================================================================================== //
//                                       HELPER: GAME TO GAMERES
// ====================================================================================================== //
type GameWithCategory = Game & { category?: Category | null };

const toGameResponse = (game: GameWithCategory): GameResponse => {
  return {
    id: game.id,
    title: game.title,
    slug: game.slug,
    description: game.description,
    instructions: game.instructions,
    coverImage: game.coverImage,
    type: game.type,
    entryPath: game.entryPath,
    status: game.status,
    isFeatured: game.isFeatured,
    order: game.order,
    plays: game.plays,
    tags: game.tags,
    seoTitle: game.seoTitle,
    seoDescription: game.seoDescription,
    publishedAt: game.publishedAt,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    categoryId: game.categoryId,
    leaderboard: game.leaderboard,
    category: game.category
      ? {
          id: game.category.id,
          name: game.category.name,
          slug: game.category.slug,
          color: game.category.color,
          icon: game.category.icon,
        }
      : null,
  };
};

// ====================================================================================================== //
//                                       HELPER: SLUG UNICO GAME
// ====================================================================================================== //
const generateUniqueGameSlug = async (
  title: string,
  excludeGameId?: string
): Promise<string> => {
  const baseSlug = generateSlug(title);

  const existing = await prisma.game.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeGameId && { id: { not: excludeGameId } }),
    },
    select: { slug: true },
  });

  if (existing.length === 0) return baseSlug;

  const numbers = existing
    .map((g) => {
      if (g.slug === baseSlug) return 1;
      const match = g.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  if (numbers.length === 0) return `${baseSlug}-2`;

  return `${baseSlug}-${Math.max(...numbers) + 1}`;
};

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI TUTTI - PUBBLICO
// ====================================================================================================== //

// GET /games
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      categoryId,
      search,
      isFeatured,
      page = "1",
      limit = "24",
      sortBy = "order",
      sortOrder = "asc",
    }: GameFilters = req.query;

    const isAdmin = req.user?.role === "ADMIN";

    const where: Prisma.GameWhereInput = {};

    // I NON ADMIN VEDONO SOLO I PUBBLICATI
    if (isAdmin && status) {
      where.status = status;
    } else if (!isAdmin) {
      where.status = "PUBLISHED";
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isFeatured === "true" || isFeatured === true) {
      where.isFeatured = true;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);

    // WHITELIST ORDINAMENTO: EVITA ERRORI PRISMA SU CAMPI INESISTENTI
    const allowedSortFields = [
      "order",
      "plays",
      "createdAt",
      "publishedAt",
      "title",
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "order";
    const safeSortOrder = sortOrder === "desc" ? "desc" : "asc";

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: { category: true },
        orderBy: { [safeSortBy]: safeSortOrder },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      prisma.game.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        games: games.map(toGameResponse),
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("Errore recupero games:", error);
    res.status(500).json({ error: "Errore durante recupero giochi" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI PER SLUG - PUBBLICO
// ====================================================================================================== //

// GET /games/slug/:slug
export const getGameBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const game = await prisma.game.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!game) {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    // LE BOZZE SONO VISIBILI SOLO ALL ADMIN
    if (game.status !== "PUBLISHED" && req.user?.role !== "ADMIN") {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    res.status(200).json({ success: true, data: toGameResponse(game) });
  } catch (error) {
    console.error("Errore recupero game:", error);
    res.status(500).json({ error: "Errore durante recupero gioco" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI SINGOLO - ADMIN
// ====================================================================================================== //

// GET /games/:id
export const getGameById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!game) {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    res.status(200).json({ success: true, data: toGameResponse(game) });
  } catch (error) {
    console.error("Errore recupero game:", error);
    res.status(500).json({ error: "Errore durante recupero gioco" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: CREA - ADMIN
// ====================================================================================================== //

// POST /games (ADMIN)
export const createGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      slug,
      description,
      instructions,
      coverImage,
      type = "INTERNAL",
      entryPath,
      status = "DRAFT",
      isFeatured,
      order,
      tags,
      seoTitle,
      seoDescription,
      categoryId,
      leaderboard = "NONE",
    }: CreateGameRequest = req.body;

    let finalSlug: string;

    if (slug) {
      const existingSlug = await prisma.game.findUnique({ where: { slug } });
      if (existingSlug) {
        res.status(409).json({ error: "Slug gia esistente" });
        return;
      }
      finalSlug = slug;
    } else {
      finalSlug = await generateUniqueGameSlug(title);
    }

    const game = await prisma.game.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        instructions: instructions?.trim() || null,
        coverImage: coverImage || null,
        type,
        entryPath: entryPath?.trim() || null,
        status,
        isFeatured: isFeatured ?? false,
        order: order ?? 0,
        tags: tags ?? [],
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        categoryId: categoryId || null,
        leaderboard,
      },
      include: { category: true },
    });

    res.status(201).json({
      success: true,
      message: "Gioco creato con successo",
      data: toGameResponse(game),
    });
  } catch (error) {
    console.error("Errore creazione game:", error);
    res.status(500).json({ error: "Errore durante creazione gioco" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: AGGIORNA - ADMIN
// ====================================================================================================== //

// PUT /games/:id
export const updateGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      instructions,
      coverImage,
      type,
      entryPath,
      status,
      isFeatured,
      order,
      tags,
      seoTitle,
      seoDescription,
      categoryId,
      leaderboard,
    }: UpdateGameRequest = req.body;

    const existing = await prisma.game.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    if (slug && slug !== existing.slug) {
      const duplicateSlug = await prisma.game.findUnique({ where: { slug } });
      if (duplicateSlug) {
        res.status(409).json({ error: "Slug gia esistente" });
        return;
      }
    }

    const updateData: Prisma.GameUpdateInput = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined)
      updateData.description = description.trim() || null;
    if (instructions !== undefined)
      updateData.instructions = instructions.trim() || null;
    if (coverImage !== undefined) updateData.coverImage = coverImage || null;
    if (type !== undefined) updateData.type = type;
    if (entryPath !== undefined) updateData.entryPath = entryPath.trim() || null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (order !== undefined) updateData.order = order;
    if (tags !== undefined) updateData.tags = tags;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle.trim() || null;
    if (seoDescription !== undefined)
      updateData.seoDescription = seoDescription.trim() || null;
    if (leaderboard !== undefined) updateData.leaderboard = leaderboard;

    if (categoryId !== undefined) {
      updateData.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true };
    }

    // PRIMA PUBBLICAZIONE: SETTA publishedAt
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.game.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    res.status(200).json({
      success: true,
      message: "Gioco aggiornato con successo",
      data: toGameResponse(updated),
    });
  } catch (error) {
    console.error("Errore update game:", error);
    res.status(500).json({ error: "Errore durante aggiornamento gioco" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: ELIMINA - ADMIN
// ====================================================================================================== //

// DELETE /games/:id
export const deleteGame = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.game.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    await prisma.game.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Gioco eliminato con successo",
    });
  } catch (error) {
    console.error("Errore eliminazione game:", error);
    res.status(500).json({ error: "Errore durante eliminazione gioco" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: INCREMENTA PARTITE - PUBBLICO
// ====================================================================================================== //

// POST /games/:slug/play
export const incrementPlays = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!game || game.status !== "PUBLISHED") {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    const updated = await prisma.game.update({
      where: { id: game.id },
      data: { plays: { increment: 1 } },
      select: { plays: true },
    });

    res.status(200).json({ success: true, plays: updated.plays });
  } catch (error) {
    console.error("Errore incremento plays:", error);
    res.status(500).json({ error: "Errore durante aggiornamento partite" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
