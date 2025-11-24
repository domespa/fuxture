import { Router } from "express";
import {
  getBreakingNews,
  getCategoryNews,
  getAvailableCategories,
} from "../controllers/breaking-news.controller";

const router = Router();

// GET /api/breaking-news - TOP NEWS GENERALI
router.get("/", getBreakingNews);

// GET /api/breaking-news/categories - CATEGORIE DISPINIBILI
router.get("/categories", getAvailableCategories);

// GET /api/breaking-news/category/:category - PER CATEGORIA
router.get("/category/:category", getCategoryNews);

export default router;
