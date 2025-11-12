import { Request, Response, NextFunction } from "express";

// ====================================================================================================== //
//                                    HELPER PER VALIDAZIONE LISTE
// ====================================================================================================== //
const isValidListName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                            MIDDLEWARE: VALIDAZIONE CREAZIONE LISTA
// ====================================================================================================== //
export const validateCreateEmailList = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: { field: string; message: string }[] = [];
  const { name, description, isPublic } = req.body;

  // NOME
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (!isValidListName(name)) {
    errors.push({
      field: "name",
      message: "Name must be between 2 and 100 characters",
    });
  }

  // DESCRIZIONE
  if (description !== undefined && typeof description !== "string") {
    errors.push({
      field: "description",
      message: "Description must be a string",
    });
  }

  // ISPUBLIC
  if (isPublic !== undefined && typeof isPublic !== "boolean") {
    errors.push({ field: "isPublic", message: "isPublic must be a boolean" });
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
//                            MIDDLEWARE: VALIDAZIONE UPDATE LISTA
// ====================================================================================================== //
export const validateUpdateEmailList = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: { field: string; message: string }[] = [];
  const { name, description, isPublic } = req.body;

  // ALMENO UN CAMPO PRESENTE
  if (!name && description === undefined && isPublic === undefined) {
    errors.push({
      field: "general",
      message: "At least one field must be provided",
    });
  }

  // NAME
  if (name !== undefined && !isValidListName(name)) {
    errors.push({
      field: "name",
      message: "Name must be between 2 and 100 characters",
    });
  }

  // DESCRIPTION
  if (description !== undefined && typeof description !== "string") {
    errors.push({
      field: "description",
      message: "Description must be a string",
    });
  }

  // ISPUBLIC
  if (isPublic !== undefined && typeof isPublic !== "boolean") {
    errors.push({ field: "isPublic", message: "isPublic must be a boolean" });
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
//                            MIDDLEWARE: VALIDAZIONE AGGIUNGI ISCRITTO
// ====================================================================================================== //
export const validateAddSubscribersToList = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: { field: string; message: string }[] = [];
  const { subscriberIds } = req.body;

  // SUBID
  if (!subscriberIds) {
    errors.push({
      field: "subscriberIds",
      message: "subscriberIds is required",
    });
  } else if (!Array.isArray(subscriberIds)) {
    errors.push({
      field: "subscriberIds",
      message: "subscriberIds must be an array",
    });
  } else if (subscriberIds.length === 0) {
    errors.push({
      field: "subscriberIds",
      message: "subscriberIds cannot be empty",
    });
  } else if (
    !subscriberIds.every((id) => typeof id === "string" && id.length > 0)
  ) {
    errors.push({
      field: "subscriberIds",
      message: "All subscriberIds must be valid strings",
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
