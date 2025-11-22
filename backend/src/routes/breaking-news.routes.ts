import { Router } from "express";
import { getBreakingNews } from "../controllers/breaking-news.controller";

const router = Router();

//  GET /api/breaking-news
router.get("/", getBreakingNews);

export default router;
