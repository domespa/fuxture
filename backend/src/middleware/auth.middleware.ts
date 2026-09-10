import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "../types/auth.types";

// ====================================================================================================== //
//                                    MIDDLEWARE: AUTENTICAZIONE TOKEN
// ====================================================================================================== //
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // ESTRAIAMO L'HEADER
  const authHeader = req.headers["authorization"];

  // CHECK E ESISTE
  if (!authHeader) {
    res.status(401).json({ error: "Access token is required" });
    return;
  }

  // ESTRAIAMO IL TOKEN
  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  // VERIFICHIAMO IL TOKEN
  // verifyToken solleva su token invalido o scaduto, non restituisce null:
  // il vecchio "if (!decoded)" non veniva mai raggiunto e l'eccezione finiva
  // nel gestore di default di Express, che rispondeva 500 in HTML. Il client
  // non poteva distinguere una sessione scaduta da un server rotto.
  try {
    const decoded = verifyToken(token);

    // PRENDIAMO TUTTO E METTIAMO NEL REQ.USER
    req.user = decoded as JwtPayload;

    next();
  } catch {
    res.status(401).json({ error: "Token non valido o scaduto" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                    MIDDLEWARE: CONTROLLO RUOLO
// ====================================================================================================== //
export const requireRole = (role: "USER" | "ADMIN") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // CONTROLLIAMO SE L'UTENTE è LOGGATO TRAMITE REQ.USER
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // CONTROLLIAMO SE IL RUOLE CORRISPONDE
    if (req.user.role !== role) {
      res.status(403).json({
        error: "Access forbidden",
        message: `This route requires ${role} role`,
      });
      return;
    }
    next();
  };
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    AUTHENTICATE TOKEN OPTIONAL
// ====================================================================================================== //
export const authenticateTokenOptional = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyToken(token) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    next();
  }
};
