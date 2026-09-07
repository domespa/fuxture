import { Router } from "express";
import {
  getEmailLogs,
  getEmailLogSummary,
} from "../controllers/email-log.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// ============================================================
//   CRONOLOGIA INVII - SOLO ADMIN
// ============================================================

// GET /email-logs/summary - prima di /, non collide ma resta leggibile qui
router.get(
  "/summary",
  authenticateToken,
  requireRole("ADMIN"),
  getEmailLogSummary
);

// GET /email-logs
router.get("/", authenticateToken, requireRole("ADMIN"), getEmailLogs);

export default router;
