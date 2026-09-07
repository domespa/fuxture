import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { Prisma } from "@prisma/client";
import { EmailStatus } from "@prisma/client";

// ====================================================================================================== //
//                                    CRONOLOGIA DEGLI INVII
//
// Legge EmailLog, che registra ogni singolo messaggio uscito dal sistema:
// campagne, email di test, anteprime e messaggi di servizio. Comprende gli
// invii falliti, che sono i piu' utili da vedere.
// ====================================================================================================== //

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

// GET /email-logs?search=&status=&campaignId=&page=&limit=
export const getEmailLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, status, campaignId } = req.query;

    const page = Math.max(parseInt(String(req.query.page ?? 1), 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const where: Prisma.EmailLogWhereInput = {};

    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.OR = [
        { recipientEmail: { contains: term, mode: "insensitive" } },
        { subject: { contains: term, mode: "insensitive" } },
      ];
    }

    if (status && Object.values(EmailStatus).includes(status as EmailStatus)) {
      where.status = status as EmailStatus;
    }

    if (campaignId) {
      where.campaignId = String(campaignId);
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: { select: { id: true, subject: true } },
          subscriber: { select: { id: true, email: true } },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          status: log.status,
          sentAt: log.sentAt,
          errorMessage: log.errorMessage,
          // Le righe scritte prima dell'introduzione del campo non hanno il
          // destinatario: si ricade sull'iscritto collegato, quando c'e'.
          recipientEmail: log.recipientEmail ?? log.subscriber?.email ?? null,
          subject: log.subject ?? log.campaign?.subject ?? null,
          campaignId: log.campaignId,
          origin: log.campaignId ? "campagna" : "manuale",
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Errore recupero cronologia invii:", error);
    res.status(500).json({ error: "Errore durante il recupero della cronologia" });
  }
};

// RIEPILOGO PER LE STATISTICHE IN TESTA ALLA PAGINA
// GET /email-logs/summary
export const getEmailLogSummary = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [total, failed, lastSend] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: EmailStatus.FAILED } }),
      prisma.emailLog.findFirst({
        orderBy: { sentAt: "desc" },
        select: { sentAt: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, failed, lastSentAt: lastSend?.sentAt ?? null },
    });
  } catch (error) {
    console.error("Errore riepilogo invii:", error);
    res.status(500).json({ error: "Errore durante il recupero del riepilogo" });
  }
};

// ====================================================================================================== //
//                    INVII MANUALI RECENTI (per riprenderli e rimandarli)
//
// Elenco leggero: niente corpo del messaggio, che su una lista peserebbe
// parecchio e non serve finche' non si sceglie quale riprendere.
// GET /email-logs/manual?limit=
// ====================================================================================================== //
export const getManualSends = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? 15), 10) || 15, 1),
      50
    );

    const logs = await prisma.emailLog.findMany({
      where: {
        campaignId: null,
        subscriberId: null,
        content: { not: null },
      },
      orderBy: { sentAt: "desc" },
      take: limit,
      select: {
        id: true,
        subject: true,
        recipientEmail: true,
        sentAt: true,
        status: true,
      },
    });

    res.status(200).json({ success: true, data: { logs } });
  } catch (error) {
    console.error("Errore recupero invii manuali:", error);
    res.status(500).json({ error: "Errore durante il recupero degli invii" });
  }
};

// SINGOLO INVIO, CORPO COMPRESO
// GET /email-logs/:id
export const getEmailLogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const log = await prisma.emailLog.findUnique({
      where: { id },
      select: {
        id: true,
        subject: true,
        recipientEmail: true,
        content: true,
        sentAt: true,
        status: true,
      },
    });

    if (!log) {
      res.status(404).json({ error: "Invio non trovato" });
      return;
    }

    res.status(200).json({ success: true, data: { log } });
  } catch (error) {
    console.error("Errore recupero invio:", error);
    res.status(500).json({ error: "Errore durante il recupero dell'invio" });
  }
};
