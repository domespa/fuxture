import { Router } from "express";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  sendTestEmail,
  sendCampaign,
} from "../controllers/campaign.controller";
import {
  validateCreateCampaign,
  validateUpdateCampaign,
} from "../middleware/campaign.validation.middleware";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// ====================================================================================================== //
//                                    ADMIN CAMPAIGN ROUTES
// ====================================================================================================== //

// CREATE CAMPAIGN
// POST /campaigns
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  validateCreateCampaign,
  createCampaign
);

// OTTIENI TUTTE FILTRATE
// GET /campaigns
router.get("/", authenticateToken, requireRole("ADMIN"), getCampaigns);

// OTTIENI SINGOLA
// GET /campaigns/:id
router.get("/:id", authenticateToken, requireRole("ADMIN"), getCampaignById);

// AGGIORNA
// PATCH /campaigns/:id
router.patch(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUpdateCampaign,
  updateCampaign
);

// DELETE
// DELETE /campaigns/:id
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteCampaign);

// TEST EMAIL
// POST /campaigns/:id/test
router.post(
  "/:id/test",
  authenticateToken,
  requireRole("ADMIN"),
  sendTestEmail
);

// MANDA CAMPAIGN
// POST /campaigns/:id/send
router.post("/:id/send", authenticateToken, requireRole("ADMIN"), sendCampaign);

export default router;
