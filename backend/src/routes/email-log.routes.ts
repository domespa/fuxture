import { Router } from "express";
import {
  getEmailLogs,
  getEmailLogSummary,
  getManualSends,
  getEmailLogById,
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

// GET /email-logs/manual - prima di /:id
router.get("/manual", authenticateToken, requireRole("ADMIN"), getManualSends);

// GET /email-logs
router.get("/", authenticateToken, requireRole("ADMIN"), getEmailLogs);

// GET /email-logs/:id - ultima, cosi' "summary" e "manual" restano raggiungibili
router.get("/:id", authenticateToken, requireRole("ADMIN"), getEmailLogById);

export default router;
