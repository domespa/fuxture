import { Router } from "express";
import {
  getContacts,
  updateContact,
  deleteContact,
} from "../controllers/address-book.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// ============================================================
//   RUBRICA - SOLO ADMIN
//   Non e' una lista di distribuzione: vedi il commento sul
//   modello Contact in schema.prisma.
// ============================================================

// GET /contacts
router.get("/", authenticateToken, requireRole("ADMIN"), getContacts);

// PATCH /contacts/:id
router.patch("/:id", authenticateToken, requireRole("ADMIN"), updateContact);

// DELETE /contacts/:id
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteContact);

export default router;
