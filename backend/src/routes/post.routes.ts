import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  getPostTags,
  updatePost,
  deletePost,
  toggleFeatured,
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
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Stesso tetto della rotta gemella su /comments: e' lo stesso gesto.
const commentRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Hai inviato troppi commenti, riprova tra qualche minuto",
});

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
// ARGOMENTI: prima di /:id, altrimenti "tags" verrebbe letto come un id
router.get("/tags", getPostTags);

// authenticateTokenOptional serve a far vedere le bozze all'admin: senza,
// req.user resta vuoto e il controller risponde 404 anche a chi ha scritto.
router.get("/slug/:slug", authenticateTokenOptional, getPostBySlug);

// LISTA POST FILTRATI
// POST /posts
router.get("/", authenticateTokenOptional, getPosts);

// OTTIENI SINGOLO POST
// GET /posts/:id
router.get("/:id", authenticateTokenOptional, getPostById);

// CREA COMMENTO SU POST
// POST /posts/:id/comments
router.post("/:id/comments", commentRateLimit, createCommentOnPost);

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

// OGGLE FEATURED
// PATCH /posts/:id/featured
router.patch(
  "/:id/featured",
  authenticateToken,
  requireRole("ADMIN"),
  toggleFeatured
);

// ELIMINA POST
// DELETE /posts/:id
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deletePost);

export default router;
