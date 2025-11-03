import { Request, Response, NextFunction } from "express";
import { PostStatus } from "../types/post.types";
// ====================================================================================================== //
//                                 MIDDLEWARE DI VALIDAZIONE: CREARE POST
// ====================================================================================================== //
export const validateCreatePost = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    title,
    content,
    status,
    scheduledAt,
    slug,
    tags,
    featuredImage,
    images,
  } = req.body;

  // TITOLO OBBLIGATORIO 3-200 CARATTERI
  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  if (title.trim().length < 3 || title.trim().length > 200) {
    res
      .status(400)
      .json({ error: "Title must be between 3 and 200 characters" });
    return;
  }

  // CONTENT OBBLIGATORIO MINIMO 10 CARATTERI
  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  if (content.trim().length < 10) {
    res.status(400).json({ error: "Content have to be more of 10 char." });
  }

  // STATUS OBBLIGATORIO
  if (!status) {
    res.status(400).json({ error: " Status is required" });
    return;
  }
  if (!Object.values(PostStatus).includes(status)) {
    res.status(401).json({
      error: "Invalid status",
      allowed: Object.values(PostStatus),
    });
    return;
  }

  // SCHEDULEDAT OBBLIGATORIO
  if (status === PostStatus.SCHEDULED) {
    if (!scheduledAt) {
      res
        .status(400)
        .json({ error: "scheduledAt is required when status is SCHEDULED" });
      return;
    }

    const scheduledDate = new Date(scheduledAt);

    // VERIFICA DATA VALIDA E FUTURA
    if (isNaN(scheduledDate.getTime())) {
      res.status(400).json({ error: "Invalid scheduledAt date format" });
      return;
    }
    if (scheduledAt <= new Date()) {
      res.status(400).json({ error: "scheduledAt must be in the future" });
      return;
    }
  }

  // SLUG
  if (slug) {
    if (typeof slug !== "string") {
      res.status(400).json({ error: "Slug must be a string" });
      return;
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      res.status(400).json({
        error: "Slug must be lowercase with hyphens only (e.g. 'my-blog-post')",
      });
      return;
    }
  }

  // TAGS
  if (tags) {
    if (!Array.isArray(tags)) {
      res.status(400).json({ error: "Tags must be an array" });
      return;
    }

    if (tags.length > 10) {
      res.status(400).json({
        error: "Maximum 10 tags allowed",
      });
      return;
    }

    for (const tag of tags) {
      if (typeof tag !== "string" || tag.trim().length === 0) {
        res.status(400).json({ error: "All tags must be non-empty strings" });
        return;
      }
      if (tag.length > 30) {
        res.status(400).json({ error: "Each tag must be max 30 characters" });
        return;
      }
    }
  }

  // FEATURED IMAGE
  if (featuredImage && typeof featuredImage !== "string") {
    res.status(400).json({ error: "featuredImage must be a string (URL)" });
    return;
  }

  // IAMGES
  if (images) {
    if (!Array.isArray(images)) {
      res.status(400).json({ error: "images must be an array" });
      return;
    }

    for (const img of images) {
      if (typeof img !== "string") {
        res.status(400).json({ error: "All images must be strings (URLs)" });
        return;
      }
    }
  }

  next();
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                 MIDDLEWARE DI VALIDAZIONE: MODIFICA POST
// ====================================================================================================== //

export const validateUpdatePost = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    title,
    content,
    status,
    scheduledAt,
    slug,
    tags,
    featuredImage,
    images,
  } = req.body;

  // ALMENO UN CAMPO DEVE ESSERE PRESENTE
  if (
    !title &&
    !content &&
    !status &&
    !scheduledAt &&
    !slug &&
    !tags &&
    !featuredImage &&
    !images &&
    req.body.isFeatured === undefined
  ) {
    res
      .status(400)
      .json({ error: "At least one field must be provided to update" });
    return;
  }

  // TUTTE LE VALIDAZIONI DI CREATE MA OPZIONALI
  // TITLE
  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 200
    ) {
      res
        .status(400)
        .json({ error: "Title must be between 3 and 200 characters" });
      return;
    }
  }
  // CONTENT
  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length < 10) {
      res.status(400).json({ error: "Content must be at least 10 characters" });
      return;
    }
  }
  // STATUS
  if (status !== undefined) {
    if (!Object.values(PostStatus).includes(status)) {
      res.status(400).json({
        error: "Invalid status",
        allowed: Object.values(PostStatus),
      });
      return;
    }

    if (status === PostStatus.SCHEDULED && !scheduledAt) {
      res.status(400).json({
        error: "scheduledAt is required when changing status to SCHEDULED",
      });
      return;
    }
  }

  if (scheduledAt !== undefined) {
    const scheduledDate = new Date(scheduledAt);

    if (isNaN(scheduledDate.getTime())) {
      res.status(400).json({ error: "Invalid scheduledAt date format" });
      return;
    }

    if (scheduledDate <= new Date()) {
      res.status(400).json({ error: "scheduledAt must be in the future" });
      return;
    }
  }
  // SLUG
  if (slug !== undefined) {
    if (typeof slug !== "string") {
      res.status(400).json({ error: "Slug must be a string" });
      return;
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      res.status(400).json({
        error: "Slug must be lowercase with hyphens only",
      });
      return;
    }
  }

  // TAGS
  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.length > 10) {
      res
        .status(400)
        .json({ error: "Tags must be an array with max 10 items" });
      return;
    }

    for (const tag of tags) {
      if (
        typeof tag !== "string" ||
        tag.trim().length === 0 ||
        tag.length > 30
      ) {
        res.status(400).json({ error: "Invalid tag format" });
        return;
      }
    }
  }

  // FEATURED IMAGE
  if (featuredImage !== undefined && typeof featuredImage !== "string") {
    res.status(400).json({ error: "featuredImage must be a string" });
    return;
  }

  // IMAGES
  if (images !== undefined) {
    if (!Array.isArray(images)) {
      res.status(400).json({ error: "images must be an array" });
      return;
    }

    for (const img of images) {
      if (typeof img !== "string") {
        res.status(400).json({ error: "All images must be strings" });
        return;
      }
    }
  }

  next();
};
// ====================================================================================================== //
// ====================================================================================================== //
