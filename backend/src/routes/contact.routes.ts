import { Router } from "express";
import { sendContactMessage } from "../controllers/contact.controller";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Ogni invio del form fa partire due email dai nostri server. Senza limite la
// rotta era di fatto un relay aperto: bastava uno script per spedire a raffica
// e bruciare la reputazione del dominio mittente.
const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Hai inviato troppi messaggi, riprova tra un'ora",
});

router.post("/", contactRateLimit, sendContactMessage);

export default router;
