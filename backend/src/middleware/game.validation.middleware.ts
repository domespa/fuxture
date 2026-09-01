import { Request, Response, NextFunction } from "express";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_TYPES = ["INTERNAL", "EMBED"];
const VALID_STATUS = ["DRAFT", "PUBLISHED"];

export const validateCreateGame = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { title, slug, type, status, entryPath, tags, order } = req.body;

  // TITLE
  if (!title) {
    errors.push({ field: "title", message: "Titolo obbligatorio" });
  } else if (
    typeof title !== "string" ||
    title.trim().length < 2 ||
    title.trim().length > 120
  ) {
    errors.push({
      field: "title",
      message: "Titolo deve essere tra 2 e 120 caratteri",
    });
  }

  // SLUG
  if (slug !== undefined) {
    if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
      errors.push({
        field: "slug",
        message: "Slug formato non valido (usa solo a-z, 0-9, -)",
      });
    }
  }

  // TYPE
  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push({ field: "type", message: "Tipo deve essere INTERNAL o EMBED" });
  }

  // STATUS
  if (status !== undefined && !VALID_STATUS.includes(status)) {
    errors.push({
      field: "status",
      message: "Status deve essere DRAFT o PUBLISHED",
    });
  }

  // ENTRY PATH - OBBLIGATORIO PER ENTRAMBI I TIPI
  if (!entryPath || typeof entryPath !== "string" || !entryPath.trim()) {
    errors.push({
      field: "entryPath",
      message:
        "Entry path obbligatorio (chiave del registry per INTERNAL, path della build per EMBED)",
    });
  }

  // TAGS
  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push({ field: "tags", message: "Tags deve essere un array" });
  }

  // ORDER
  if (order !== undefined && typeof order !== "number") {
    errors.push({ field: "order", message: "Order deve essere un numero" });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export const validateUpdateGame = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { title, slug, type, status, entryPath, tags, order } = req.body;

  if (Object.keys(req.body).length === 0) {
    errors.push({
      field: "general",
      message: "Almeno un campo deve essere presente",
    });
  }

  // TITLE
  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      title.trim().length < 2 ||
      title.trim().length > 120
    ) {
      errors.push({
        field: "title",
        message: "Titolo deve essere tra 2 e 120 caratteri",
      });
    }
  }

  // SLUG
  if (slug !== undefined) {
    if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
      errors.push({ field: "slug", message: "Slug formato non valido" });
    }
  }

  // TYPE
  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push({ field: "type", message: "Tipo deve essere INTERNAL o EMBED" });
  }

  // STATUS
  if (status !== undefined && !VALID_STATUS.includes(status)) {
    errors.push({
      field: "status",
      message: "Status deve essere DRAFT o PUBLISHED",
    });
  }

  // ENTRY PATH
  if (entryPath !== undefined) {
    if (typeof entryPath !== "string" || !entryPath.trim()) {
      errors.push({
        field: "entryPath",
        message: "Entry path non puo essere vuoto",
      });
    }
  }

  // TAGS
  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push({ field: "tags", message: "Tags deve essere un array" });
  }

  // ORDER
  if (order !== undefined && typeof order !== "number") {
    errors.push({ field: "order", message: "Order deve essere un numero" });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
