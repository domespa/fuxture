import { Router } from "express";
import {
  subscribe,
  getSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber,
  unsubscribe,
  unsubscribeById,
  getPreferences,
  updatePreferences,
} from "../controllers/subscriber.controller";
import {
  validateCreateSub,
  validateUpdateSubscriber,
  validateUnsubscribe,
  validateUpdatePreferences,
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

// POST /subscribers/unsubscribe/:id
router.post("/unsubscribe", validateUnsubscribe, unsubscribe);

// CANCELLAZION
// GET /subscribers/unsubscribe
router.get("/unsubscribe/:id", unsubscribeById);

// CENTRO PREFERENZE - REVOCA GRANULARE DEL CONSENSO
// Le Linee Guida del Garante del 17/04/2026 (par. 6) indicano di inserire
// in ogni messaggio "una icona standardizzata ovvero un link, posizionato
// nel footer, che conduca l'utente verso un'area dedicata all'esercizio
// dei suoi diritti", dove poter cessare il solo tracciamento continuando a
// ricevere le comunicazioni.
// GET /subscribers/preferences/:id
router.get("/preferences/:id", getPreferences);

// PUT /subscribers/preferences/:id
router.put("/preferences/:id", validateUpdatePreferences, updatePreferences);

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
  updateSubscriber,
);

// ELIMINA
// DELETE /subscribers/:id
router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  deleteSubscriber,
);

export default router;
