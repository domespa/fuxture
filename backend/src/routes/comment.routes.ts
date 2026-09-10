import { Router } from "express";
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";
import {
  validateCreateComment,
  validateUpdateComment,
} from "../middleware/comment.validation.middleware";
import {
  authenticateToken,
  authenticateTokenOptional,
  requireRole,
} from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// I commenti anonimi finiscono comunque in moderazione, ma senza limite la
// coda si riempie piu' in fretta di quanto si possa svuotarla.
const commentRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Hai inviato troppi commenti, riprova tra qualche minuto",
});

// ====================================================================================================== //
//                                         PUBLIC ROUTES
// ====================================================================================================== //
// OTTIENI LISTA COMMENTI
// GET /comments
router.get("/", authenticateTokenOptional, getComments);

// OTTIENI SINGOLO COMMENTO
// GET /comments/:id
router.get("/:id", authenticateTokenOptional, getCommentById);

// CREA COMMENTO
// POST /comments
router.post(
  "/",
  commentRateLimit,
  authenticateTokenOptional,
  validateCreateComment,
  createComment
);
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                          ADMIN ROUTES
// ====================================================================================================== //
// AGGIORNA COMMENTO
// PUT /comments/:id
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdateComment,
  updateComment
);

// AGGIORNA STATUS COMMENTO
// PATCH /comments/:id/status
router.patch(
  "/:id/status",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdateComment,
  updateComment
);

// ELIMINA COMMENTO
// DELETE /comments/:id
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteComment);

// ====================================================================================================== //
// ====================================================================================================== //

export default router;
