import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { GameScore } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type {
  GameScoreResponse,
  SubmitScoreRequest,
} from "../types/game.types";
import {
  getPeriodKey,
  sanitizeDetail,
  sanitizePlayerName,
  MIN_NAME_LENGTH,
} from "../utils/leaderboard.utils";
import {
  containsBannedWord,
  findBannedWord,
} from "../utils/profanity.utils";

// TETTO DI SICUREZZA: oltre questo il punteggio e sicuramente falso.
// Tenerlo alto: a Fuxtrix un tetris al livello 10 vale gia 8000 punti da solo,
// quindi un tetto basso rifiuterebbe le partite dei giocatori bravi.
const MAX_SCORE = 1_000_000;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// ====================================================================================================== //
//                                       HELPER: SCORE TO RESPONSE
// ====================================================================================================== //
const toScoreResponse = (
  score: GameScore,
  position: number
): GameScoreResponse => ({
  id: score.id,
  position,
  playerName: score.playerName,
  score: score.score,
  detail: score.detail,
  createdAt: score.createdAt,
});

// ====================================================================================================== //
//                                    CONTROLLER: CLASSIFICA - PUBBLICO
// ====================================================================================================== //

// GET /games/:slug/scores
export const getScores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, status: true, leaderboard: true },
    });

    if (!game || game.status !== "PUBLISHED") {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    if (game.leaderboard === "NONE") {
      res.status(200).json({
        success: true,
        data: { period: game.leaderboard, periodKey: null, scores: [] },
      });
      return;
    }

    const periodKey = getPeriodKey(game.leaderboard);

    const scores = await prisma.gameScore.findMany({
      where: { gameId: game.id, periodKey },
      orderBy: [{ score: "desc" }, { updatedAt: "asc" }],
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: {
        period: game.leaderboard,
        periodKey,
        scores: scores.map((score, index) => toScoreResponse(score, index + 1)),
      },
    });
  } catch (error) {
    console.error("Errore recupero classifica:", error);
    res.status(500).json({ error: "Errore durante recupero classifica" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: INVIA PUNTEGGIO - PUBBLICO
// ====================================================================================================== //

// POST /games/:slug/scores
export const submitScore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { playerName, score, detail }: SubmitScoreRequest = req.body;

    const cleanName = sanitizePlayerName(playerName);

    if (cleanName.length < MIN_NAME_LENGTH) {
      res.status(400).json({
        error: `Il nome deve avere almeno ${MIN_NAME_LENGTH} caratteri`,
      });
      return;
    }

    // Il termine che ha fatto scattare il blocco resta nei log e non viene
    // restituito: dirlo al giocatore trasformerebbe il messaggio di errore in
    // una mappa per aggirare il filtro.
    const bannedWord = findBannedWord(cleanName);
    if (bannedWord) {
      console.warn(
        `⚠️ Nome rifiutato in classifica: "${cleanName}" (termine: ${bannedWord})`
      );
      res.status(400).json({
        error: "Questo nome non è ammesso in classifica. Scegline un altro.",
      });
      return;
    }

    if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
      res.status(400).json({ error: "Punteggio non valido" });
      return;
    }

    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, status: true, leaderboard: true },
    });

    if (!game || game.status !== "PUBLISHED") {
      res.status(404).json({ error: "Gioco non trovato" });
      return;
    }

    if (game.leaderboard === "NONE") {
      res.status(400).json({ error: "Questo gioco non ha una classifica" });
      return;
    }

    const periodKey = getPeriodKey(game.leaderboard);
    const cleanDetail = sanitizeDetail(detail);

    // UN SOLO RECORD PER GIOCATORE NEL PERIODO: TENIAMO IL MIGLIORE.
    // La lettura serve solo a sapere se e' un record personale, per la
    // risposta. La scrittura passa da upsert: con findUnique seguito da
    // create, due partite chiuse nello stesso istante finivano entrambe nel
    // ramo "non esiste" e la seconda sbatteva sul vincolo di unicita'.
    const existing = await prisma.gameScore.findUnique({
      where: {
        gameId_periodKey_playerName: {
          gameId: game.id,
          periodKey,
          playerName: cleanName,
        },
      },
    });

    const isPersonalBest = !existing || score > existing.score;

    const best = await prisma.gameScore.upsert({
      where: {
        gameId_periodKey_playerName: {
          gameId: game.id,
          periodKey,
          playerName: cleanName,
        },
      },
      create: {
        gameId: game.id,
        periodKey,
        playerName: cleanName,
        score,
        detail: cleanDetail,
      },
      // Il punteggio si aggiorna solo se migliora quello gia' in classifica.
      update: isPersonalBest ? { score, detail: cleanDetail } : {},
    });

    // POSIZIONE IN CLASSIFICA
    const better = await prisma.gameScore.count({
      where: {
        gameId: game.id,
        periodKey,
        score: { gt: best.score },
      },
    });

    const scores = await prisma.gameScore.findMany({
      where: { gameId: game.id, periodKey },
      orderBy: [{ score: "desc" }, { updatedAt: "asc" }],
      take: DEFAULT_LIMIT,
    });

    res.status(201).json({
      success: true,
      data: {
        period: game.leaderboard,
        periodKey,
        rank: better + 1,
        isPersonalBest,
        playerName: cleanName,
        scores: scores.map((entry, index) => toScoreResponse(entry, index + 1)),
      },
    });
  } catch (error) {
    console.error("Errore invio punteggio:", error);
    res.status(500).json({ error: "Errore durante invio punteggio" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: ELIMINA PUNTEGGIO - ADMIN
// ====================================================================================================== //

// DELETE /games/scores/:id
export const deleteScore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.gameScore.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Punteggio non trovato" });
      return;
    }

    await prisma.gameScore.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Punteggio eliminato con successo",
    });
  } catch (error) {
    console.error("Errore eliminazione punteggio:", error);
    res.status(500).json({ error: "Errore durante eliminazione punteggio" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                          RINOMINA UN NOME IN CLASSIFICA (ADMIN)
//
// L'alternativa era solo cancellare il punteggio, che pero' punisce il
// giocatore anche quando il problema e' il solo nickname. Rinominare conserva
// il risultato e toglie la scritta.
// PATCH /games/scores/:id
// ====================================================================================================== //
export const renameScore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const cleanName = sanitizePlayerName(req.body?.playerName);

    if (cleanName.length < MIN_NAME_LENGTH) {
      res.status(400).json({
        error: `Il nome deve avere almeno ${MIN_NAME_LENGTH} caratteri`,
      });
      return;
    }

    // Il filtro vale anche qui: non c'e' ragione per cui una moderazione
    // debba poter reintrodurre proprio cio' che sta rimuovendo.
    if (containsBannedWord(cleanName)) {
      res.status(400).json({
        error: "Questo nome non è ammesso in classifica",
      });
      return;
    }

    const existing = await prisma.gameScore.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Punteggio non trovato" });
      return;
    }

    try {
      const updated = await prisma.gameScore.update({
        where: { id },
        data: { playerName: cleanName },
      });

      res.status(200).json({
        success: true,
        message: "Nome aggiornato con successo",
        data: {
          id: updated.id,
          playerName: updated.playerName,
          score: updated.score,
        },
      });
    } catch (error) {
      // Un solo record per giocatore nel periodo: il nuovo nome puo'
      // collidere con un punteggio gia' presente nella stessa classifica.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({
          error:
            "Esiste già un punteggio con questo nome nella stessa classifica",
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error("Errore rinomina punteggio:", error);
    res.status(500).json({ error: "Errore durante la rinomina del punteggio" });
  }
};

// ====================================================================================================== //
//                        ELENCO PUNTEGGI PER LA MODERAZIONE (ADMIN)
//
// getScores() serve la classifica pubblica: solo il periodo corrente, solo
// giochi pubblicati, massimo 50 righe. Per moderare serve l'opposto: tutti i
// periodi, bozze comprese, perche' un nome offensivo nella classifica di ieri
// resta comunque in tabella.
// GET /games/scores/moderation?gameId=&search=&limit=
// ====================================================================================================== //
const MODERATION_LIMIT = 200;
const MODERATION_MAX_LIMIT = 500;

export const listScoresForModeration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { gameId, search } = req.query;

    const limit = Math.min(
      Math.max(
        parseInt(String(req.query.limit ?? MODERATION_LIMIT), 10) ||
          MODERATION_LIMIT,
        1
      ),
      MODERATION_MAX_LIMIT
    );

    const where: Prisma.GameScoreWhereInput = {};

    if (gameId) {
      where.gameId = String(gameId);
    }

    if (search && String(search).trim()) {
      where.playerName = {
        contains: String(search).trim(),
        mode: "insensitive",
      };
    }

    const scores = await prisma.gameScore.findMany({
      where,
      orderBy: [{ periodKey: "desc" }, { score: "desc" }],
      take: limit,
      include: {
        game: { select: { title: true, slug: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        scores: scores.map((entry) => ({
          id: entry.id,
          playerName: entry.playerName,
          score: entry.score,
          detail: entry.detail,
          periodKey: entry.periodKey,
          gameId: entry.gameId,
          gameTitle: entry.game.title,
          createdAt: entry.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Errore elenco punteggi per moderazione:", error);
    res.status(500).json({ error: "Errore durante il recupero dei punteggi" });
  }
};
