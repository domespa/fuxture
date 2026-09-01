import { Router } from "express";
import {
  getGames,
  getGameBySlug,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  incrementPlays,
} from "../controllers/game.controller";
import {
  validateCreateGame,
  validateUpdateGame,
} from "../middleware/game.validation.middleware";
import {
  getScores,
  submitScore,
  deleteScore,
} from "../controllers/game-score.controller";
import {
  authenticateToken,
  authenticateTokenOptional,
  requireRole,
} from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// MAX 20 PUNTEGGI INVIATI IN 10 MINUTI DALLO STESSO IP
const scoreRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Hai inviato troppi punteggi, riprova tra qualche minuto",
});

// ====================================================================================================== //
//                                          PUBBLICHE ROUTES
// ====================================================================================================== //
// OTTIENI TUTTI (admin loggato vede anche le bozze)
// GET /games
router.get("/", authenticateTokenOptional, getGames);

// OTTIENI PER SLUG
// GET /games/slug/:slug
router.get("/slug/:slug", authenticateTokenOptional, getGameBySlug);

// INCREMENTA CONTATORE PARTITE
// POST /games/:slug/play
router.post("/:slug/play", incrementPlays);

// CLASSIFICA DEL GIOCO
// GET /games/:slug/scores
router.get("/:slug/scores", getScores);

// INVIA PUNTEGGIO
// POST /games/:slug/scores
router.post("/:slug/scores", scoreRateLimit, submitScore);

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                          ADMIN ROUTES
// ====================================================================================================== //

router.get("/:id", authenticateToken, requireRole("ADMIN"), getGameById);

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  validateCreateGame,
  createGame
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdateGame,
  updateGame
);

// MODERAZIONE CLASSIFICHE: PRIMA DI /:id, ALTRIMENTI "scores" VIENE LETTO COME UN ID
router.delete(
  "/scores/:id",
  authenticateToken,
  requireRole("ADMIN"),
  deleteScore
);

router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteGame);

export default router;
