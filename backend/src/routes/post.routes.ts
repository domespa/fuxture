import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import {
  validateCreatePost,
  validateUpdatePost,
} from "../middleware/post.validation.middleware";
import {
  authenticateToken,
  requireRole,
  authenticateTokenOptional,
} from "../middleware/auth.middleware";
import { isSlugValid } from "../utils/slug.utils";
import { createCommentOnPost } from "../controllers/comment.controller";

const router = Router();

// ====================================================================================================== //
//                                   PUBLIC ROUTES
// ====================================================================================================== //

// SLUG
// GET /posts/check-slug/:slug
router.get("/check-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const available = await isSlugValid(slug);

    res.json({ available });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Errore verifica slug",
    });
  }
});

// OTTIENI POST PER SLUG
// GET /posts/slug/:slug
router.get("/slug/:slug", getPostBySlug);

// LISTA POST FILTRATI
// POST /posts
router.get("/", authenticateTokenOptional, getPosts);

// OTTIENI SINGOLO POST
// GET /posts/:id
router.get("/:id", authenticateTokenOptional, getPostById);

// CREA COMMENTO SU POST
// POST /posts/:id/comments
router.post("/:id/comments", createCommentOnPost);

// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                   ADMIN ROUTES
// ====================================================================================================== //
// CREA NUOVO POST
// POST /posts
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  validateCreatePost,
  createPost
);

// AGGIORNA POST
// PUT /posts/:id
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdatePost,
  updatePost
);

// ELIMINA POST
// DELETE /posts/:id
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deletePost);

export default router;
