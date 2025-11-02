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
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: "Token expired" });
    return;
  }

  // PREDIAMO TUTTO E METTIAMO NEL REQUSER
  req.user = decoded as JwtPayload;

  next();
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
