import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  CommentStatus,
  CommentResponse,
  CommentListResponse,
  CommentFilters,
} from "../types/comment.types";

// ====================================================================================================== //
//                                    CONTROLLER: CREATE COMMENTO
// ====================================================================================================== //
export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, authorName, authorEmail, postId, parentId } = req.body;

    // AUTOAPPROVATO SE COMMENTO PROVIENE DA UTENTE LOGGATO
    const status = req.user ? CommentStatus.APPROVED : CommentStatus.PENDING;

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.toLowerCase().trim(),
        status,
        postId: postId,
        parentId: parentId || null,
      },
    });

    res.status(201).json({
      message:
        status === CommentStatus.APPROVED
          ? "Comment published successfully"
          : "Comment submitted for moderation",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                CONTROLLER: CREATE COMMENTO SU POST
// ====================================================================================================== //
export const createCommentOnPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const { content, authorName, authorEmail } = req.body;

    // VALIDAZIONE
    if (!content || !authorName || !authorEmail) {
      res.status(400).json({
        success: false,
        message: "Compila tutti i campi obbligatori",
      });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post non trovato",
      });
      return;
    }

    if (post.status !== "PUBLISHED") {
      res.status(400).json({
        success: false,
        message: "Non è possibile commentare questo post",
      });
      return;
    }

    // STATO PENDING
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.toLowerCase().trim(),
        status: CommentStatus.PENDING,
        postId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Commento inviato! Sarà visibile dopo l'approvazione.",
      data: comment,
    });
  } catch (error) {
    console.error("Errore nella creazione del commento:", error);
    res.status(500).json({
      success: false,
      message: "Errore nell'invio del commento",
    });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                CONTROLLER: GET COMMENTI FILTRATI E IMPAGINATI
// ====================================================================================================== //
export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      postId,
      status,
      parentId,
      search,
      page = "1",
      limit = "10",
    } = req.query as CommentFilters;

    // IMPAGINAZIONE
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    // COSTRUZIONI FILTRAGGIO
    const where: any = {};

    // POSTID
    if (postId) {
      where.postId = postId;
    }

    // STATUS
    if (req.user?.role === "ADMIN") {
      if (status) {
        where.status = status;
      }
    } else {
      where.status = CommentStatus.APPROVED;
    }

    // PARENTID
    if (parentId !== undefined) {
      where.parentId = parentId === "null" ? null : parentId;
    }

    // SEARCH
    if (search && typeof search === "string") {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    // QUERY CON IMPAGINAZIONE
    const [rawComments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          authorName: true,
          authorEmail: true,
          status: true,
          postId: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const comments = rawComments as unknown as CommentResponse[];
    const totalPages = Math.ceil(total / limitNum);

    const response: CommentListResponse = {
      comments,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                      GET COMMENTO UTENTE BY ID
// ====================================================================================================== //
export const getCommentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const rawComment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        authorName: true,
        authorEmail: true,
        status: true,
        postId: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const comment = rawComment as unknown as CommentResponse | null;

    if (
      req.user?.role !== "ADMIN" &&
      comment?.status !== CommentStatus.APPROVED
    ) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    res.json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({ error: "Failed to fetch comment" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                     ADMIN: UPDATE COMMENT
// ====================================================================================================== //
export const updateComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;

    // VERIFICHIAMO SE IL COMMENTO ESISTE
    const existComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existComment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    // COSTRUZIONE DATA PER UPDATE
    const updateData: any = {};

    if (content !== undefined) {
      updateData.content = content.trim();
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
// ====================================================================================================== //
//                                     ADMIN: DELETE COMMENT
// ====================================================================================================== //
export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // VERIFICHIAMO SE ESISTE
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
