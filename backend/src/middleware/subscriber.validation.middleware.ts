import { Request, Response, NextFunction } from "express";
import { SubscriberStatus } from "../generated/prisma";
import { isValidEmail } from "./validation.middleware";

// ====================================================================================================== //
//                                    MIDDLEWARE: VALIDAZIONE SUBSCRIBER
// ====================================================================================================== //

export const validateCreateSub = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { email, name, source } = req.body;

  // EMAIL OBBLIGATORIA
  if (!email) {
    errors.push({ field: "email", message: "Email Obbligatoria" });
  } else if (typeof email !== "string" || !isValidEmail(email.trim())) {
    errors.push({ field: "email", message: "Email non valida" });
  }

  // NOME
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push({
        field: "name",
        message: "Nome deve essere almeno 2 caratteri",
      });
    }
  }

  // SOURCE
  if (source !== undefined) {
    if (typeof source !== "string" || source.length > 50) {
      errors.push({
        field: "source",
        message: "Source deve essere massimo 50 caratteri",
      });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    MIDDLEWARE: AGGIORNAMENTO SUBSCRIBER
// ====================================================================================================== //
export const validateUpdateSubscriber = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { name, status, metadata } = req.body;

  // ALMENO UN CAMPO PRESENTE
  if (!name && !status && !metadata) {
    errors.push({
      field: "general",
      message: "Almeno un campo deve essere presente (name, status, metadata)",
    });
  }

  // NOME
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push({
        field: "name",
        message: "Nome deve essere almeno 2 caratteri",
      });
    }
  }

  // STATUS
  if (status !== undefined) {
    const validStatuses = Object.values(SubscriberStatus);
    if (!validStatuses.includes(status)) {
      errors.push({
        field: "status",
        message: `Status deve essere uno di: ${validStatuses.join(", ")}`,
      });
    }
  }

  // METADATA
  if (metadata !== undefined) {
    if (typeof metadata !== "object" || Array.isArray(metadata)) {
      errors.push({
        field: "metadata",
        message: "Metadata deve essere un oggetto JSON",
      });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    MIDDLEWARE: UNSUBSCRIBER
// ====================================================================================================== //
export const validateUnsubscribe = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { email } = req.body;

  if (!email) {
    errors.push({ field: "email", message: "Email obbligatoria" });
  } else if (typeof email !== "string" || !isValidEmail(email.trim())) {
    errors.push({ field: "email", message: "Email non valida" });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
