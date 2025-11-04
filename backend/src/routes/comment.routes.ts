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

const router = Router();

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

// ELIMINA COMMENTO
// DELETE /comments/:id
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteComment);

// ====================================================================================================== //
// ====================================================================================================== //

export default router;
