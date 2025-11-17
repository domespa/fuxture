import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../middleware/category.validation.middleware";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                          PUBBLICHE ROUTES
// ====================================================================================================== //
// OTTIENI TUTTE
// GET /categories
router.get("/", getCategories);

// OTTIENI UNA
// GET /categories/:id
router.get("/:id", getCategoryById);

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                          ADMIN ROUTES
// ====================================================================================================== //

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  validateCreateCategory,
  createCategory
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdateCategory,
  updateCategory
);

router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteCategory);

export default router;
