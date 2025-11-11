import { Router } from "express";
import {
  subscribe,
  getSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber,
  unsubscribe,
} from "../controllers/subscriber.controller";
import {
  validateCreateSub,
  validateUpdateSubscriber,
  validateUnsubscribe,
} from "../middleware/subscriber.validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/auth.middleware";

const router = Router();

// ============================================================
//                    ROUTES PUBBLICHE
// ============================================================
// ISCRIZIONE
// POST /subscribers
router.post("/", validateCreateSub, subscribe);

// CANCELLAZION
// POST /subscribers/unsubscribe
router.post("/unsubscribe", validateUnsubscribe, unsubscribe);

// ============================================================
//                    ROUTES ADMIN
// ============================================================
// OTTIENI TUTTI
// GET /subscribers
router.get("/", authenticateToken, requireRole("ADMIN"), getSubscribers);

// OTTIENI SINGOLO
// GET/subscribers/:id
router.get("/:id", authenticateToken, requireRole("ADMIN"), getSubscriberById);

// AGGIORNA
// PUT /subscribers/:id
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdateSubscriber,
  updateSubscriber
);

// ELIMINA
// DELETE /subscribers/:id
router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  deleteSubscriber
);

export default router;
