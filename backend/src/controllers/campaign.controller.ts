import { Request, Response } from "express";
import { prisma } from "../config/database";
import { emailConfig } from "../config/config.email";
import { personalizeForRecipient } from "../services/tracking.service";
import { rememberContact } from "./address-book.controller";
import {
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignFilters,
  CampaignListResponse,
  CampaignResponse,
} from "../types/campaign.types";
import { CampaignStatus, SubscriberStatus, Prisma } from "@prisma/client";
import { sendBatchEmails, sendEmail } from "../services/email.service";

// ====================================================================================================== //
//                                   HELPER: BUILD CAMPAIGN RESPONSE
// ====================================================================================================== //
async function buildCampaignResponse(
  campaignId: string
): Promise<CampaignResponse> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      emailLogs: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // CALCOLA STATISTICHE
  const totalSent = campaign.emailLogs.filter((log) =>
    ["SENT", "DELIVERED", "OPENED", "CLICKED"].includes(log.status)
  ).length;

  const totalFailed = campaign.emailLogs.filter((log) =>
    ["BOUNCED", "FAILED"].includes(log.status)
  ).length;

  return {
    id: campaign.id,
    subject: campaign.subject,
    content: campaign.content,
    fromName: campaign.fromName,
    status: campaign.status,
    scheduledAt: campaign.scheduledAt,
    sentAt: campaign.sentAt,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    createdBy: campaign.createdBy,
    emailStats: {
      totalSent,
      totalFailed,
    },
  };
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                       CREA CAMPAGNA
// ====================================================================================================== //
export async function createCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data: CreateCampaignRequest = req.body;
    const createdById = req.user!.userId;

    // VALIDAZIONE LISTE
    if (data.listIds && data.listIds.length > 0) {
      const existingLists = await prisma.emailList.findMany({
        where: {
          id: { in: data.listIds },
        },
        select: { id: true },
      });

      const existingIds = existingLists.map((list) => list.id);
      const invalidIds = data.listIds.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        res.status(400).json({
          error: "Some list IDs are invalid",
          invalidIds,
        });
        return;
      }
    }

    // PREPARA DATI
    const campaignData: Prisma.EmailCampaignCreateInput = {
      subject: data.subject.trim(),
      content: data.content.trim(),
      fromName: data.fromName?.trim() || null,
      status: data.status || CampaignStatus.DRAFT,
      createdBy: {
        connect: { id: createdById },
      },
      ...(data.status === CampaignStatus.SCHEDULED &&
        data.scheduledAt && {
          scheduledAt: new Date(data.scheduledAt),
        }),
      ...(data.listIds &&
        data.listIds.length > 0 && {
          targetLists: {
            connect: data.listIds.map((id) => ({ id })),
          },
        }),
    };

    // CREA CAMPAGNA
    const campaign = await prisma.emailCampaign.create({
      data: campaignData,
    });

    // BUILD RESPONSE
    const response = await buildCampaignResponse(campaign.id);

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   OTTIENI CAMPAGNE CON FILTRI
// ====================================================================================================== //
export async function getCampaigns(req: Request, res: Response): Promise<void> {
  try {
    const filters: CampaignFilters = req.query;
    const page = Math.max(1, parseInt(filters.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(filters.limit as string) || 10)
    );
    const skip = (page - 1) * limit;

    // ORDINE
    type SortByField = keyof Prisma.EmailCampaignOrderByWithRelationInput;
    const sortBy = (filters.sortBy as SortByField) || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    // WHERE
    const where: Prisma.EmailCampaignWhereInput = {
      ...(filters.status &&
        filters.status !== "ALL" && {
          status: filters.status as CampaignStatus,
        }),
      ...(filters.creatorId && { createdById: filters.creatorId }),
      ...(filters.search && {
        subject: {
          contains: filters.search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      }),
      ...((filters.createdAfter || filters.createdBefore) && {
        createdAt: {
          ...(filters.createdAfter && { gte: new Date(filters.createdAfter) }),
          ...(filters.createdBefore && {
            lte: new Date(filters.createdBefore),
          }),
        },
      }),
      ...((filters.sentAfter || filters.sentBefore) && {
        sentAt: {
          ...(filters.sentAfter && { gte: new Date(filters.sentAfter) }),
          ...(filters.sentBefore && { lte: new Date(filters.sentBefore) }),
        },
      }),
    };

    // QUERY
    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          emailLogs: {
            select: {
              status: true,
            },
          },
        },
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    // BUILD RESPONSES CON STATS
    const campaignResponses: CampaignResponse[] = campaigns.map((campaign) => {
      const totalSent = campaign.emailLogs.filter((log) =>
        ["SENT", "DELIVERED", "OPENED", "CLICKED"].includes(log.status)
      ).length;

      const totalFailed = campaign.emailLogs.filter((log) =>
        ["BOUNCED", "FAILED"].includes(log.status)
      ).length;

      return {
        id: campaign.id,
        subject: campaign.subject,
        content: campaign.content,
        fromName: campaign.fromName,
        status: campaign.status,
        scheduledAt: campaign.scheduledAt,
        sentAt: campaign.sentAt,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        createdBy: campaign.createdBy,
        emailStats: {
          totalSent,
          totalFailed,
        },
      };
    });

    const totalPages = Math.ceil(total / limit);
    const response: CampaignListResponse = {
      campaigns: campaignResponses,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    OTTIENI SINGOLA CAMPAGNA
// ====================================================================================================== //
export async function getCampaignById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const campaign = await buildCampaignResponse(id);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    if (error instanceof Error && error.message === "Campaign not found") {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   AGGIORNA CAMPAGNA
// ====================================================================================================== //
export async function updateCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const data: UpdateCampaignRequest = req.body;

    // ESISTE?
    const existingCampaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    // NON PUOI MODIFICARE CAMPAGNE GIÀ INVIATE
    if (
      existingCampaign.status === CampaignStatus.SENT ||
      existingCampaign.status === CampaignStatus.SENDING
    ) {
      res.status(400).json({
        error: "Cannot update campaign that is sending or already sent",
      });
      return;
    }

    // PREPARA DATI UPDATE
    const updateData: Prisma.EmailCampaignUpdateInput = {
      ...(data.subject !== undefined && { subject: data.subject.trim() }),
      ...(data.content !== undefined && { content: data.content.trim() }),
      ...(data.fromName !== undefined && {
        fromName: data.fromName?.trim() || null,
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.status === CampaignStatus.SCHEDULED &&
        data.scheduledAt && {
          scheduledAt: new Date(data.scheduledAt),
        }),
    };

    // UPDATE
    await prisma.emailCampaign.update({
      where: { id },
      data: updateData,
    });

    // BUILD RESPONSE
    const response = await buildCampaignResponse(id);

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   ELIMINA CAMPAGNA
// ====================================================================================================== //
export async function deleteCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    // NON PUOI ELIMINARE CAMPAGNE IN INVIO
    if (campaign.status === CampaignStatus.SENDING) {
      res.status(400).json({
        error: "Cannot delete campaign that is currently sending",
      });
      return;
    }

    await prisma.emailCampaign.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   INVIA EMAIL DI TEST
// ====================================================================================================== //
export async function sendTestEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { testEmail } = req.body;

    // VALIDA EMAIL
    if (!testEmail || typeof testEmail !== "string") {
      res.status(400).json({ error: "testEmail is required" });
      return;
    }

    // TROVA CAMPAGNA
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    // PLACEHOLDER PER TEST (usa email di test come ID)
    // Tutti gli invii usano la stessa pagina pubblica di disiscrizione.
    const testUnsubscribeUrl = emailConfig.email.unsubscribeUrl;
    const testPreferencesUrl = `${process.env.FRONTEND_URL}/preferenze/test`;
    const personalizedContent = campaign.content
      .replace(/\{\{unsubscribe_url\}\}/g, testUnsubscribeUrl)
      .replace(/\{\{preferences_url\}\}/g, testPreferencesUrl);

    // DETERMINA FROM_NAME
    const fromName =
      campaign.fromName || process.env.SMTP_FROM_NAME || "Fuxture";

    // La rubrica registra il tentativo, non l'esito: un indirizzo scritto a
    // mano resta utile anche se l'invio fallisce, ed e' anzi il caso in cui
    // serve di piu', perche' si riprovera'.
    await rememberContact(testEmail);

    // INVIA EMAIL
    const result = await sendEmail({
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: personalizedContent,
      fromName,
    });

    if (!result.success) {
      res.status(502).json({
        error: "Invio non riuscito",
        detail: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: "Failed to send test email" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   INVIA CAMPAGNA
// ====================================================================================================== //
export async function sendCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // TROVA CAMPAGNA
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    // VERIFICA STATUS (solo DRAFT o SCHEDULED possono essere inviate)
    if (
      campaign.status !== CampaignStatus.DRAFT &&
      campaign.status !== CampaignStatus.SCHEDULED
    ) {
      res.status(400).json({
        error: "Campaign can only be sent if status is DRAFT or SCHEDULED",
      });
      return;
    }

    // PRENDI TUTTI I SUBSCRIBER ACTIVE
    // RECUPERA SUBSCRIBERS
    let subscribers;

    // CHECK LISTE TARGETIZZATE
    const campaignWithLists = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        targetLists: {
          include: {
            subscribers: {
              include: {
                subscriber: true,
              },
            },
          },
        },
      },
    });

    if (
      campaignWithLists?.targetLists &&
      campaignWithLists.targetLists.length > 0
    ) {
      // CASO 1: CAMPAGNA CON LISTE
      // RACCOGLI TUTI GLI ISCRTTI A QUELLA LISTA
      const subscriberIds = new Set<string>();

      campaignWithLists.targetLists.forEach((list) => {
        list.subscribers.forEach((sub) => {
          // SOLO ATTIVI
          if (sub.subscriber.status === SubscriberStatus.ACTIVE) {
            subscriberIds.add(sub.subscriber.id);
          }
        });
      });

      subscribers = await prisma.subscriber.findMany({
        where: {
          id: { in: Array.from(subscriberIds) },
        },
      });

      console.log(
        `Campaign targets ${campaignWithLists.targetLists.length} list(s), found ${subscribers.length} unique active subscribers`
      );
    } else {
      // CASO 2: NESSUNA LISTA QUINDI INVIA A TUTTI GLI UTENTI ATTIVI
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: SubscriberStatus.ACTIVE,
        },
      });

      console.log(
        `Campaign targets ALL subscribers, found ${subscribers.length} active subscribers`
      );
    }

    if (subscribers.length === 0) {
      res.status(400).json({
        error: "No active subscribers found for this campaign",
      });
      return;
    }

    if (subscribers.length === 0) {
      res.status(400).json({
        error: "No active subscribers found",
      });
      return;
    }

    // AGGIORNA STATUS A SENDING
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENDING,
      },
    });

    // DETERMINA FROM_NAME
    const fromName =
      campaign.fromName || process.env.SMTP_FROM_NAME || "Fuxture";

    // PREPARA RECIPIENTS CON CONTENT PERSONALIZZATO
    let strippedRecipients = 0;

    const recipients = subscribers.map((subscriber) => {
      const unsubscribeUrl = emailConfig.email.unsubscribeUrl;
      // IL LINK ALLE PREFERENZE USA L'ID INTERNO, NON IL trackingId: quest'ultimo
      // viaggia verso i server di terzi a ogni apertura e non deve dare accesso
      // all'area di gestione dei consensi.
      const preferencesUrl = `${process.env.FRONTEND_URL}/preferenze/${subscriber.id}`;

      const personalizedContent = campaign.content
        .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl)
        .replace(/\{\{preferences_url\}\}/g, preferencesUrl);

      // SOSTITUISCE LE MACRO {email} DELLE CREATIVITA' DI TERZI CON
      // L'IDENTIFICATIVO OPACO E, PER CHI HA REVOCATO IL SOLO CONSENSO AL
      // TRACCIAMENTO, RIMUOVE I MARCATORI RECAPITANDO COMUNQUE LA CAMPAGNA.
      const { html, strippedPixels } = personalizeForRecipient(
        personalizedContent,
        {
          trackingId: subscriber.trackingId,
          trackingConsent: subscriber.trackingConsent,
        }
      );

      if (strippedPixels.length > 0) {
        strippedRecipients++;
      }

      return {
        email: subscriber.email,
        html,
        subscriberId: subscriber.id,
      };
    });

    if (strippedRecipients > 0) {
      console.log(
        `🔒 Tracciamento rimosso per ${strippedRecipients} destinatari che hanno revocato il consenso`
      );
    }

    // INVIO BATCH
    console.log(`Starting campaign ${id} to ${recipients.length} subscribers`);
    const result = await sendBatchEmails({
      subject: campaign.subject,
      fromName,
      recipients,
      campaignId: campaign.id,
    });
    console.log(
      `Campaign ${id} completed: ${result.sent} sent, ${result.failed} failed`
    );

    // AGGIORNA STATUS A SENT
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENT,
        sentAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Campaign sent successfully",
      data: {
        totalRecipients: result.total,
        sent: result.sent,
        failed: result.failed,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error("Error sending campaign:", error);

    // ROLLBACK STATUS SE ERRORE
    try {
      await prisma.emailCampaign.update({
        where: { id: req.params.id },
        data: {
          status: CampaignStatus.DRAFT,
        },
      });
    } catch (rollbackError) {
      console.error("Error rolling back campaign status:", rollbackError);
    }

    res.status(500).json({ error: "Failed to send campaign" });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                      INVIA PW
// ====================================================================================================== //
export async function sendPreviewEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { toEmail, subject, content, fromName } = req.body;

    // VALIDAZIONI
    if (!toEmail || !subject || !content) {
      res.status(400).json({ error: "Campi obbligatori mancanti" });
      return;
    }

    // FROM_NAME
    const senderName =
      fromName?.trim() || process.env.SMTP_FROM_NAME || "Fuxture";

    // PLACEHOLDER PER PREVIEW
    const previewUnsubscribeUrl = emailConfig.email.unsubscribeUrl;
    const previewWebVersionUrl = `${process.env.FRONTEND_URL}/email/preview`;

    const personalizedContent = content
      .replace(/\{\{unsubscribe_url\}\}/g, previewUnsubscribeUrl)
      .replace(/\{\{web_version_url\}\}/g, previewWebVersionUrl)
      .replace(
        /\{\{preferences_url\}\}/g,
        `${process.env.FRONTEND_URL}/preferenze/preview`
      );

    // INVIA EMAIL
    // sendEmail() cattura internamente gli errori SMTP e li restituisce nel
    // risultato invece di sollevarli: senza questo controllo l'endpoint
    // rispondeva "inviata con successo" anche quando l'invio era fallito.
    // Solo gli invii manuali alimentano la rubrica: le campagne pescano da
    // Subscriber, dove il consenso e' registrato, e non devono aggiungere
    // nulla qui.
    await rememberContact(toEmail);

    const result = await sendEmail({
      to: toEmail,
      subject: subject,
      html: personalizedContent,
      fromName: senderName,
    });

    if (!result.success) {
      res.status(502).json({
        error: "Invio non riuscito",
        detail: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Email preview inviata a ${toEmail}`,
    });
  } catch (error) {
    console.error("Errore invio email preview:", error);
    // L'endpoint e' riservato agli amministratori: restituire il messaggio
    // reale evita di dover leggere i log del server per capire cosa e'
    // successo. Un "errore generico" costa piu' tempo di quanto protegga.
    res.status(500).json({
      error: "Errore durante l'invio dell'email preview",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

// ====================================================================================================== //
//                         ULTIMO NUMERO INVIATO (PUBBLICO)
//
// Serve al form di iscrizione in home: mostrare l'oggetto dell'ultima
// comunicazione spedita trasforma un invito generico in una prova di cosa si
// riceve. Escono solo oggetto e data, niente contenuto e niente destinatari.
// GET /campaigns/latest
// ====================================================================================================== //
export async function getLatestSentCampaign(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { status: CampaignStatus.SENT },
      orderBy: { sentAt: "desc" },
      select: { subject: true, sentAt: true },
    });

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    console.error("Errore recupero ultima campagna:", error);
    res.status(500).json({ error: "Errore durante il recupero" });
  }
}
