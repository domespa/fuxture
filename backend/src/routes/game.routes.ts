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
  authenticateToken,
  authenticateTokenOptional,
  requireRole,
} from "../middleware/auth.middleware";

const router = Router();

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

router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteGame);

export default router;
