import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { CommentStatus } from "../types/comment.types";

// REGEX EMAIL
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ====================================================================================================== //
//                                    MIDDLEWARE: VALIDAZIONE COMMENTO
// ====================================================================================================== //

export const validateCreateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, authorName, authorEmail, postId, parentId } = req.body;

    // VALIDAZIONI CAMPI
    // CONTENT
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 3) {
      res
        .status(400)
        .json({ error: "Content must be at least 3 characters long" });
      return;
    }

    if (trimmedContent.length > 1000) {
      res
        .status(400)
        .json({ error: "Content must not exceed 1000 characters" });
      return;
    }

    // AUTHORNAME
    if (!authorName || typeof authorName !== "string") {
      res.status(400).json({ error: "Author name is required" });
      return;
    }

    if (authorName.trim().length < 2) {
      res
        .status(400)
        .json({ error: "Author name must be at least 2 characters long" });
      return;
    }

    // AUTHOR EMAIL
    if (!authorEmail || typeof authorEmail !== "string") {
      res.status(400).json({ error: "Author email is required" });
      return;
    }

    if (!EMAIL_REGEX.test(authorEmail)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // POST ID
    if (!postId || typeof postId !== "string") {
      res.status(400).json({ error: "Post ID is required" });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // PARENTID
    if (parentId) {
      if (typeof parentId !== "string") {
        res.status(400).json({ error: "Invalid parent ID format" });
        return;
      }

      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        res.status(404).json({ error: "Parent comment not found" });
        return;
      }

      if (parentComment.postId !== postId) {
        res
          .status(400)
          .json({ error: "Parent comment belongs to a different post" });
        return;
      }
    }

    next();
  } catch (error) {}
};

// VALIDAZIONE AGGIORNAMENTO COMMENTO
export const validateUpdateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, status } = req.body;

    // ALMENO 1 PRESENTE
    if (!content && !status) {
      res
        .status(400)
        .json({ error: "At least one field (content or status) is required" });
      return;
    }

    // CONTENT
    if (content !== undefined) {
      if (typeof content !== "string") {
        res.status(400).json({ error: "Content must be a string" });
        return;
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length < 3) {
        res
          .status(400)
          .json({ error: "Content must be at least 3 characters long" });
        return;
      }

      if (trimmedContent.length > 1000) {
        res
          .status(400)
          .json({ error: "Content must not exceed 1000 characters" });
        return;
      }
    }

    // STATUS
    if (status !== undefined) {
      const validStatuses = Object.values(CommentStatus);
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
