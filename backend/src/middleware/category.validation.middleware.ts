import { Request, Response, NextFunction } from "express";

export const validateCreateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { name, slug, color } = req.body;

  // NAME
  if (!name) {
    errors.push({ field: "name", message: "Nome obbligatorio" });
  } else if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    errors.push({
      field: "name",
      message: "Nome deve essere tra 2 e 100 caratteri",
    });
  }

  // SLUG
  if (slug !== undefined) {
    if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push({
        field: "slug",
        message: "Slug formato non valido (usa solo a-z, 0-9, -)",
      });
    }
  }

  // COLOR
  if (color !== undefined) {
    if (typeof color !== "string" || !/^#[0-9A-F]{6}$/i.test(color)) {
      errors.push({
        field: "color",
        message: "Colore deve essere hex (#RRGGBB)",
      });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export const validateUpdateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Array<{ field: string; message: string }> = [];
  const { name, slug, color, description, icon, order, isActive } = req.body;

  if (
    !name &&
    !slug &&
    !color &&
    !description &&
    icon === undefined &&
    order === undefined &&
    isActive === undefined
  ) {
    errors.push({
      field: "general",
      message: "Almeno un campo deve essere presente",
    });
  }

  // NAME
  if (name !== undefined) {
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      errors.push({
        field: "name",
        message: "Nome deve essere tra 2 e 100 caratteri",
      });
    }
  }

  // SLUG
  if (slug !== undefined) {
    if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push({ field: "slug", message: "Slug formato non valido" });
    }
  }

  // COLOR
  if (color !== undefined) {
    if (typeof color !== "string" || !/^#[0-9A-F]{6}$/i.test(color)) {
      errors.push({ field: "color", message: "Colore deve essere hex" });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
