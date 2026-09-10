import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  CommentStatus,
  CommentResponse,
  CommentListResponse,
  CommentFilters,
} from "../types/comment.types";

// ====================================================================================================== //
//                              NUCLEO CONDIVISO DELLA CREAZIONE COMMENTO
//
// Le due rotte pubbliche - POST /comments e POST /posts/:id/comments -
// facevano la stessa cosa con controlli diversi: solo la seconda verificava
// che il post esistesse e fosse pubblicato, quindi dalla prima si potevano
// commentare le bozze e un postId inesistente diventava un 500 sul vincolo
// di chiave esterna. Il controllo vive qui una volta sola.
// ====================================================================================================== //
type CommentDraft = {
  content: string;
  authorName: string;
  authorEmail: string;
  postId: string;
  parentId?: string | null;
};

type CommentCreationOutcome =
  | { ok: true; comment: Awaited<ReturnType<typeof prisma.comment.create>> }
  | { ok: false; status: number; message: string };

const createCommentRecord = async (
  draft: CommentDraft,
  isAuthenticated: boolean
): Promise<CommentCreationOutcome> => {
  const post = await prisma.post.findUnique({
    where: { id: draft.postId },
    select: { id: true, status: true },
  });

  if (!post) {
    return { ok: false, status: 404, message: "Post non trovato" };
  }

  if (post.status !== "PUBLISHED") {
    return {
      ok: false,
      status: 400,
      message: "Non è possibile commentare questo post",
    };
  }

  // UNA RISPOSTA DEVE APPENDERSI A UN COMMENTO DELLO STESSO ARTICOLO
  if (draft.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: draft.parentId },
      select: { postId: true },
    });

    if (!parent || parent.postId !== draft.postId) {
      return {
        ok: false,
        status: 400,
        message: "Il commento a cui stai rispondendo non esiste",
      };
    }
  }

  // AUTOAPPROVATO SE IL COMMENTO PROVIENE DA UTENTE LOGGATO
  const status = isAuthenticated
    ? CommentStatus.APPROVED
    : CommentStatus.PENDING;

  const comment = await prisma.comment.create({
    data: {
      content: draft.content.trim(),
      authorName: draft.authorName.trim(),
      authorEmail: draft.authorEmail.toLowerCase().trim(),
      status,
      postId: draft.postId,
      parentId: draft.parentId || null,
    },
  });

  return { ok: true, comment };
};

// ====================================================================================================== //
//                                    CONTROLLER: CREATE COMMENTO
// ====================================================================================================== //
export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, authorName, authorEmail, postId, parentId } = req.body;

    const outcome = await createCommentRecord(
      { content, authorName, authorEmail, postId, parentId },
      Boolean(req.user)
    );

    if (!outcome.ok) {
      res.status(outcome.status).json({ error: outcome.message });
      return;
    }

    res.status(201).json({
      message:
        outcome.comment.status === CommentStatus.APPROVED
          ? "Comment published successfully"
          : "Comment submitted for moderation",
      comment: outcome.comment,
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

    // Questa rotta non passa da authenticateTokenOptional: resta sempre in
    // moderazione, come prima.
    const outcome = await createCommentRecord(
      { content, authorName, authorEmail, postId },
      false
    );

    if (!outcome.ok) {
      res.status(outcome.status).json({
        success: false,
        message: outcome.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Commento inviato! Sarà visibile dopo l'approvazione.",
      data: outcome.comment,
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
          // Titolo e slug servono a mostrare i commenti fuori dalla pagina
          // dell'articolo, per esempio in home.
          post: { select: { title: true, slug: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    // L'indirizzo e-mail di chi commenta e' un dato personale e non ha
    // ragione di uscire da qui: prima veniva restituito a chiunque
    // interrogasse l'endpoint pubblico. Resta visibile solo agli amministratori.
    const isAdmin = req.user?.role === "ADMIN";

    const comments = rawComments.map((comment) => {
      const { authorEmail, ...rest } = comment;
      return (isAdmin ? comment : rest) as unknown as CommentResponse;
    });
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

    const isAdmin = req.user?.role === "ADMIN";

    if (!isAdmin && rawComment?.status !== CommentStatus.APPROVED) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    // L'indirizzo di chi commenta e' un dato personale. getComments lo toglie
    // gia' ai non amministratori; qui usciva comunque, su qualunque commento
    // approvato.
    let comment = rawComment as unknown as CommentResponse | null;

    if (!isAdmin && rawComment) {
      const { authorEmail, ...rest } = rawComment;
      void authorEmail;
      comment = rest as unknown as CommentResponse;
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
