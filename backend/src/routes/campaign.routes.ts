import { Router } from "express";
import {
  createCampaign,
  getCampaigns,
  getLatestSentCampaign,
  getNewsletterCreative,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  sendTestEmail,
  sendCampaign,
  sendPreviewEmail,
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

// INVIA PW
// POST /campaigns/send-preview
router.post(
  "/send-preview",
  authenticateToken,
  requireRole("ADMIN"),
  sendPreviewEmail
);

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
// ULTIMO NUMERO INVIATO: rotta pubblica, prima di /:id.
// Espone solo oggetto e data, serve alla prova sociale del form in home.
router.get("/latest", getLatestSentCampaign);

router.get("/", authenticateToken, requireRole("ADMIN"), getCampaigns);

// HTML DI UNA CREATIVITA NEWSLETTER: anche questa prima di /:id,
// altrimenti "newsletter-creative" verrebbe letto come un id campagna.
// GET /campaigns/newsletter-creative/:name
router.get(
  "/newsletter-creative/:name",
  authenticateToken,
  requireRole("ADMIN"),
  getNewsletterCreative
);

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
