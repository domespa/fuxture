import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { Subscriber, Prisma } from "@prisma/client";
import type {
  CreateSubscriberRequest,
  UpdateSubscriberRequest,
  UnsubscribeRequest,
  SubscriberResponse,
  SubscriberListResponse,
  SubscriberActionResponse,
  SubscriberFilters,
} from "../types/subscriber.types";
import {
  sendWelcomeEmail,
  sendUnsubscribeConfirmationEmail,
} from "../services/email.service";

const toSubscriberResponse = (subscriber: Subscriber): SubscriberResponse => ({
  id: subscriber.id,
  email: subscriber.email,
  name: subscriber.name,
  status: subscriber.status,
  subscribedAt: subscriber.subscribedAt,
  unsubscribedAt: subscriber.unsubscribedAt,
  source: subscriber.source,
  metadata: subscriber.metadata as Record<string, unknown> | null,
  createdAt: subscriber.createdAt,
  updatedAt: subscriber.updatedAt,
});

// ISCRIZIONE NEWSLETTER
// POST /subscribers
export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, source }: CreateSubscriberRequest = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // CHECK SE ESISTE GIà
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === "ACTIVE") {
        res.status(409).json({
          error: "Questa email è già iscritta alla newsletter",
        });
        return;
      }

      // RIATTIVA
      const reactivated = await prisma.subscriber.update({
        where: { email: normalizedEmail },
        data: {
          status: "ACTIVE",
          subscribedAt: new Date(),
          unsubscribedAt: null,
          name: name?.trim() || existingSubscriber.name,
          source: source || existingSubscriber.source,
        },
      });

      // EMAIL DI BENVENUTO RIATTIVAZIONE
      try {
        await sendWelcomeEmail(
          reactivated.email,
          reactivated.name || undefined,
        );
        console.log(
          `✅ Welcome email sent to ${reactivated.email} (reactivated)`,
        );
      } catch (emailError) {
        console.error("⚠️ Failed to send welcome email:", emailError);
      }

      res.status(200).json({
        success: true,
        message: "Iscrizione riattivata con successo! Benvenuto/a di nuovo!",
        subscriber: toSubscriberResponse(reactivated),
      });
      return;
    }

    // CREA NUOVO
    const subscriber = await prisma.subscriber.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        source: source || null,
        status: "ACTIVE",
        subscribedAt: new Date(),
      },
    });

    // EMAIL DI BENVENUTO
    try {
      await sendWelcomeEmail(subscriber.email, subscriber.name || undefined);
      console.log(`✅ Welcome email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.error("⚠️ Failed to send welcome email:", emailError);
    }

    res.status(201).json({
      success: true,
      message:
        "Iscrizione completata con successo! Grazie per esserti iscritto/a!",
      subscriber: toSubscriberResponse(subscriber),
    });
  } catch (error) {
    console.error("Errore iscrizione subscriber:", error);
    res
      .status(500)
      .json({ error: "Errore durante iscrizione alla newsletter" });
  }
};

// OTTIENI TUTTI - ADMIN
// GET /subscribers
export const getSubscribers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      page = "1",
      limit = "20",
      sortBy = "subscribedAt",
      sortOrder = "desc",
    }: SubscriberFilters = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const where: Prisma.SubscriberWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // QUERY
    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.subscriber.count({ where }),
    ]);

    // STATS
    const stats = await prisma.subscriber.groupBy({
      by: ["status"],
      _count: true,
    });

    const statsFormatted = {
      totalActive: stats.find((s) => s.status === "ACTIVE")?._count || 0,
      totalUnsubscribed:
        stats.find((s) => s.status === "UNSUBSCRIBED")?._count || 0,
      totalBounced: stats.find((s) => s.status === "BOUNCED")?._count || 0,
    };

    const totalPages = Math.ceil(total / limitNum);

    const response: SubscriberListResponse = {
      subscribers: subscribers.map(toSubscriberResponse),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      stats: statsFormatted,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Errore recupero subscribers:", error);
    res.status(500).json({ error: "Errore durante recupero subscribers" });
  }
};

// OTTIENI SINGOLO - ADMIN
// GET /subscribers/:id
export const getSubscriberById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ error: "Subscriber non trovato" });
      return;
    }

    res.status(200).json(toSubscriberResponse(subscriber));
  } catch (error) {
    console.error("Errore recupero subscriber:", error);
    res.status(500).json({ error: "Errore durante recupero subscriber" });
  }
};

// AGGIORNA - ADMIN
// PUT /subscribers/:id
export const updateSubscriber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, status, metadata }: UpdateSubscriberRequest = req.body;
    const existing = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Subscriber non trovato" });
      return;
    }

    const updateData: Prisma.SubscriberUpdateInput = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (status !== undefined) {
      updateData.status = status;

      if (status === "UNSUBSCRIBED" && existing.status !== "UNSUBSCRIBED") {
        updateData.unsubscribedAt = new Date();
      }
      if (status === "ACTIVE" && existing.status === "UNSUBSCRIBED") {
        updateData.unsubscribedAt = null;
        updateData.subscribedAt = new Date();
      }
    }

    if (metadata !== undefined) {
      updateData.metadata = metadata as Prisma.InputJsonValue;
    }

    // AGGIORNA
    const updated = await prisma.subscriber.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Subscriber aggiornato con successo",
      subscriber: toSubscriberResponse(updated),
    });
  } catch (error) {
    console.error("Errore update subscriber:", error);
    res.status(500).json({ error: "Errore durante aggiornamento subscriber" });
  }
};

// ELIMINA- ADMIN
// DELETE /subscribers/:id
export const deleteSubscriber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Subscriber non trovato" });
      return;
    }

    // HARD DELETE
    await prisma.subscriber.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Subscriber eliminato con successo",
    });
  } catch (error) {
    console.error("Errore eliminazione subscriber:", error);
    res.status(500).json({ error: "Errore durante eliminazione subscriber" });
  }
};

// ELIMINA - PUBBLICO
// POST /subscribers/unsubscribe
export const unsubscribe = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email }: UnsubscribeRequest = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!subscriber) {
      res.status(404).json({
        error: "Email non trovata nella lista newsletter",
      });
      return;
    }

    if (subscriber.status === "UNSUBSCRIBED") {
      res.status(200).json({
        success: true,
        message: "Sei già disiscritto/a dalla newsletter",
      });
      return;
    }

    const updatedSubscriber = await prisma.subscriber.update({
      where: { email: normalizedEmail },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    // INVIA EMAIL DI CONFERMA CANCELLAZIONE
    try {
      await sendUnsubscribeConfirmationEmail(
        updatedSubscriber.email,
        updatedSubscriber.name || undefined,
      );
      console.log(
        `✅ Unsubscribe confirmation email sent to ${updatedSubscriber.email}`,
      );
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send unsubscribe confirmation email:",
        emailError,
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Disiscrizione completata con successo. Ci dispiace vederti andare!",
    });
  } catch (error) {
    console.error("Errore unsubscribe:", error);
    res.status(500).json({ error: "Errore durante disiscrizione" });
  }
};

// DISISCRIZIONE VIA LINK EMAIL - PUBBLICO
// GET /subscribers/unsubscribe/:id
export const unsubscribeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ error: "Subscriber non trovato" });
      return;
    }

    if (subscriber.status === "UNSUBSCRIBED") {
      res.status(200).json({
        success: true,
        message: "Sei già disiscritto/a dalla newsletter",
      });
      return;
    }

    const updated = await prisma.subscriber.update({
      where: { id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    try {
      await sendUnsubscribeConfirmationEmail(
        updated.email,
        updated.name || undefined,
      );
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send unsubscribe confirmation email:",
        emailError,
      );
    }

    res.status(200).json({
      success: true,
      message: "Disiscrizione completata con successo.",
    });
  } catch (error) {
    console.error("Errore unsubscribeById:", error);
    res.status(500).json({ error: "Errore durante disiscrizione" });
  }
};
