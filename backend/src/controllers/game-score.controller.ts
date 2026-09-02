import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { GameScore } from "@prisma/client";
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

    // UN SOLO RECORD PER GIOCATORE NEL PERIODO: TENIAMO IL MIGLIORE
    const existing = await prisma.gameScore.findUnique({
      where: {
        gameId_periodKey_playerName: {
          gameId: game.id,
          periodKey,
          playerName: cleanName,
        },
      },
    });

    let best = existing;

    if (!existing) {
      best = await prisma.gameScore.create({
        data: {
          gameId: game.id,
          periodKey,
          playerName: cleanName,
          score,
          detail: cleanDetail,
        },
      });
    } else if (score > existing.score) {
      best = await prisma.gameScore.update({
        where: { id: existing.id },
        data: { score, detail: cleanDetail },
      });
    }

    // POSIZIONE IN CLASSIFICA
    const better = await prisma.gameScore.count({
      where: {
        gameId: game.id,
        periodKey,
        score: { gt: best!.score },
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
        isPersonalBest: !existing || score > existing.score,
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
