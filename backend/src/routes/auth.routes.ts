import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { validateLogin } from "../middleware/validation.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";
// ====================================================================================================== //
//                                              SETUP ROUTER
// ====================================================================================================== //
const router = Router();

// Il login e' l'unica porta d'ingresso all'area amministrativa e non aveva
// alcun limite: una lista di password si poteva provare tutta, alla velocita'
// della rete. Il tetto e' basso perche' nessuna persona reale sbaglia dieci
// volte in un quarto d'ora.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Troppi tentativi di accesso, riprova tra qualche minuto",
});
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                              ROTTE
// ====================================================================================================== //
// La registrazione pubblica e' chiusa di proposito: gli account
// amministrativi si creano a mano. La rotta, il controller register() e
// validateRegister restano disponibili se un giorno servisse riaprirla.

// LOGIN UTENTE
// POST /auth/login
router.post("/login", loginRateLimit, validateLogin, login);
// ====================================================================================================== //
// ====================================================================================================== //

export default router;
