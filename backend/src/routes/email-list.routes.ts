import { Router } from "express";
import {
  createEmailList,
  getEmailLists,
  getEmailListById,
  updateEmailList,
  deleteEmailList,
  addSubscribersToList,
  removeSubscriberFromList,
  getListSubscribers,
} from "../controllers/email-list.controller";
import {
  validateCreateEmailList,
  validateUpdateEmailList,
  validateAddSubscribersToList,
} from "../middleware/email-list.validation.middleware";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// ====================================================================================================== //
//                                         ROTTE TUTTE ADMIN
// ====================================================================================================== //
router.use(authenticateToken, requireRole("ADMIN"));

// CREA LISTA
// POST /email-lists
router.post("/", validateCreateEmailList, createEmailList);

// OTTIENI TUTTE
// GET /email-lists
router.get("/", getEmailLists);

// OTTIENI LISTA
// GET /email-lists/:id
router.get("/:id", getEmailListById);

// AGGIORNA LISTA
// PUT /email-lists/:id
router.put("/:id", validateUpdateEmailList, updateEmailList);

// ELIMINA LISTA
// DELETE /email-lists/:id
router.delete("/:id", deleteEmailList);

// ===== GESTIONE SUBS NELLE LISTE ===== //
// AGGIUNGI
// POST /email-lists/:listId/subscribers
router.post(
  "/:listId/subscribers",
  validateAddSubscribersToList,
  addSubscribersToList
);

// OTTIENI LISTA SUBS
// GET /email-lists/:listId/subscribers
router.get("/:listId/subscribers", getListSubscribers);

// DELETE SUBS DALLA LISTA
// DELETE /email-lists/:listId/subscribers/:subId
router.delete("/:listId/subscribers/:subscriberId", removeSubscriberFromList);

export default router;
