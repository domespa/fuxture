import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { Subscriber, Prisma } from "@prisma/client";
import { ConsentType } from "@prisma/client";
import type {
  CreateSubscriberRequest,
  UpdateSubscriberRequest,
  UnsubscribeRequest,
  UpdatePreferencesRequest,
  SubscriberResponse,
  SubscriberListResponse,
  SubscriberActionResponse,
  SubscriberFilters,
} from "../types/subscriber.types";
import {
  sendWelcomeEmail,
  sendUnsubscribeConfirmationEmail,
} from "../services/email.service";

// COLONNE SU CUI E' LECITO ORDINARE (il valore arriva dalla query string)
const SORTABLE_SUBSCRIBER_FIELDS = [
  "subscribedAt",
  "createdAt",
  "updatedAt",
  "email",
  "name",
  "status",
];

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

// Il Garante impone che "tutte le scelte dell'interessato siano debitamente
// registrate dal titolare, anche ai fini della dimostrazione cui questi
// potrebbe essere chiamato" (Linee Guida tracking pixel 17/04/2026, par. 6;
// art. 7 par. 1 GDPR). Da qui la registrazione di ogni consenso e revoca.
const getClientIp = (req: Request): string | null => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || null;
};

const getUserAgent = (req: Request): string | null => {
  const agent = req.headers["user-agent"];
  return typeof agent === "string" ? agent.slice(0, 500) : null;
};

const recordConsent = async (params: {
  subscriberId: string;
  type: ConsentType;
  granted: boolean;
  text?: string | null;
  source?: string | null;
  req: Request;
}): Promise<void> => {
  try {
    await prisma.consentLog.create({
      data: {
        subscriberId: params.subscriberId,
        type: params.type,
        granted: params.granted,
        text: params.text || null,
        source: params.source || null,
        ipAddress: getClientIp(params.req),
        userAgent: getUserAgent(params.req),
      },
    });
  } catch (error) {
    // La registrazione della prova non deve mai far fallire l'operazione
    // richiesta dall'interessato, ma va segnalata.
    console.error("⚠️ Impossibile registrare il consenso:", error);
  }
};

// ISCRIZIONE NEWSLETTER
// POST /subscribers
export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      name,
      source,
      consentText,
    }: CreateSubscriberRequest = req.body;
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
          // NUOVA MANIFESTAZIONE DI VOLONTA': sostituisce la precedente
          consentAt: new Date(),
          consentSource: source || existingSubscriber.source,
          consentText: consentText || null,
          consentIp: getClientIp(req),
          trackingConsent: true,
          trackingConsentAt: new Date(),
        },
      });

      await recordConsent({
        subscriberId: reactivated.id,
        type: ConsentType.NEWSLETTER,
        granted: true,
        text: consentText,
        source: source || existingSubscriber.source,
        req,
      });
      await recordConsent({
        subscriberId: reactivated.id,
        type: ConsentType.TRACKING,
        granted: true,
        text: consentText,
        source: source || existingSubscriber.source,
        req,
      });

      // EMAIL DI BENVENUTO RIATTIVAZIONE
      try {
        await sendWelcomeEmail(
          reactivated.email,
          reactivated.name || undefined,
          reactivated.id,
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
        // Il consenso unico raccolto al momento dell'iscrizione copre anche il
        // tracciamento: il Garante ammette espressamente che quest'ultimo sia
        // "ricompreso in quello, piu' generale, alla ricezione delle
        // comunicazioni promozionali" (par. 6), purche' l'informativa lo dica.
        consentAt: new Date(),
        consentSource: source || null,
        consentText: consentText || null,
        consentIp: getClientIp(req),
        trackingConsent: true,
        trackingConsentAt: new Date(),
      },
    });

    await recordConsent({
      subscriberId: subscriber.id,
      type: ConsentType.NEWSLETTER,
      granted: true,
      text: consentText,
      source,
      req,
    });
    await recordConsent({
      subscriberId: subscriber.id,
      type: ConsentType.TRACKING,
      granted: true,
      text: consentText,
      source,
      req,
    });

    // EMAIL DI BENVENUTO
    try {
      await sendWelcomeEmail(
        subscriber.email,
        subscriber.name || undefined,
        subscriber.id,
      );
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

    // Page e limit arrivano dalla query string: senza limiti "?page=0" dava
    // uno skip negativo e "?limit=abc" un NaN, entrambi errori di Prisma.
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string, 10) || 20, 1),
      100
    );
    const skip = (pageNum - 1) * limitNum;

    // Elenco chiuso: il valore finisce dentro orderBy.
    const orderField = SORTABLE_SUBSCRIBER_FIELDS.includes(sortBy as string)
      ? (sortBy as string)
      : "subscribedAt";
    const orderDirection = sortOrder === "asc" ? "asc" : "desc";

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
        orderBy: { [orderField]: orderDirection },
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

    // La rotta e' pubblica e senza autenticazione: rispondere 404 su un
    // indirizzo sconosciuto e 200 su uno iscritto la trasformava in un modo
    // per verificare chi e' nella lista, un indirizzo alla volta. La risposta
    // e' la stessa in entrambi i casi.
    const genericConfirmation = {
      success: true,
      message:
        "Se l'indirizzo è iscritto alla newsletter, la disiscrizione è stata registrata.",
    };

    if (!subscriber) {
      res.status(200).json(genericConfirmation);
      return;
    }

    // Anche "sei gia' disiscritto" distinguerebbe un indirizzo presente in
    // archivio da uno sconosciuto: stessa risposta.
    if (subscriber.status === "UNSUBSCRIBED") {
      res.status(200).json(genericConfirmation);
      return;
    }

    const updatedSubscriber = await prisma.subscriber.update({
      where: { email: normalizedEmail },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    // REVOCA TOTALE DEL CONSENSO: va registrata (art. 7 par. 1 GDPR)
    await recordConsent({
      subscriberId: updatedSubscriber.id,
      type: ConsentType.NEWSLETTER,
      granted: false,
      source: "form-disiscrizione",
      req,
    });

    // INVIA EMAIL DI CONFERMA CANCELLAZIONE
    try {
      await sendUnsubscribeConfirmationEmail(
        updatedSubscriber.email,
        updatedSubscriber.name || undefined,
        updatedSubscriber.id,
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

    res.status(200).json(genericConfirmation);
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

    // REVOCA TOTALE DEL CONSENSO: va registrata (art. 7 par. 1 GDPR)
    await recordConsent({
      subscriberId: updated.id,
      type: ConsentType.NEWSLETTER,
      granted: false,
      source: "link-disiscrizione",
      req,
    });

    try {
      await sendUnsubscribeConfirmationEmail(
        updated.email,
        updated.name || undefined,
        updated.id,
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

// ====================================================================================================== //
//                          CENTRO PREFERENZE - REVOCA GRANULARE
//
// Le Linee Guida del Garante del 17/04/2026 (par. 6) impongono che
// l'interessato possa revocare il consenso "anche in modo granulare: optando
// cioe' per la revoca del consenso unico prestato, con l'effetto di impedire
// la futura ricezione di ulteriori messaggi, oppure revocandolo solo
// parzialmente, con esclusivo riguardo soltanto al tracciamento connesso alla
// ricezione di tracking pixel".
//
// Chi rifiuta il solo tracciamento continua a ricevere le comunicazioni:
// "alla persona che intenda rifiutare il tracciamento dovra' essere garantita
// la piena fruibilita' del servizio, che non dovra' comunque subire, per
// questa sola ragione, alcuna limitazione".
// ====================================================================================================== //

// LEGGE LE PREFERENZE CORRENTI
// GET /subscribers/preferences/:id
export const getPreferences = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ error: "Iscrizione non trovata" });
      return;
    }

    res.status(200).json({
      email: subscriber.email,
      name: subscriber.name,
      subscribed: subscriber.status === "ACTIVE",
      trackingConsent: subscriber.trackingConsent,
      subscribedAt: subscriber.subscribedAt,
    });
  } catch (error) {
    console.error("Errore lettura preferenze:", error);
    res
      .status(500)
      .json({ error: "Errore durante il recupero delle preferenze" });
  }
};

// AGGIORNA LE PREFERENZE
// PUT /subscribers/preferences/:id
export const updatePreferences = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { trackingConsent, subscribed }: UpdatePreferencesRequest = req.body;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!subscriber) {
      res.status(404).json({ error: "Iscrizione non trovata" });
      return;
    }

    const data: Prisma.SubscriberUpdateInput = {};

    // REVOCA DEL SOLO TRACCIAMENTO: L'ISCRIZIONE RESTA ATTIVA
    if (
      typeof trackingConsent === "boolean" &&
      trackingConsent !== subscriber.trackingConsent
    ) {
      data.trackingConsent = trackingConsent;
      data.trackingConsentAt = new Date();
    }

    // REVOCA COMPLETA: DISISCRIZIONE
    if (typeof subscribed === "boolean") {
      const isActive = subscriber.status === "ACTIVE";
      if (!subscribed && isActive) {
        data.status = "UNSUBSCRIBED";
        data.unsubscribedAt = new Date();
      }
      if (subscribed && !isActive) {
        data.status = "ACTIVE";
        data.unsubscribedAt = null;
        data.subscribedAt = new Date();
        data.consentAt = new Date();
      }
    }

    if (Object.keys(data).length === 0) {
      res.status(200).json({
        success: true,
        message: "Nessuna modifica da applicare",
        preferences: {
          subscribed: subscriber.status === "ACTIVE",
          trackingConsent: subscriber.trackingConsent,
        },
      });
      return;
    }

    const updated = await prisma.subscriber.update({
      where: { id },
      data,
    });

    // REGISTRAZIONE DELLE SCELTE (art. 7 par. 1 GDPR)
    if (data.trackingConsent !== undefined) {
      await recordConsent({
        subscriberId: updated.id,
        type: ConsentType.TRACKING,
        granted: updated.trackingConsent,
        source: "centro-preferenze",
        req,
      });
    }
    if (data.status !== undefined) {
      await recordConsent({
        subscriberId: updated.id,
        type: ConsentType.NEWSLETTER,
        granted: updated.status === "ACTIVE",
        source: "centro-preferenze",
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferenze aggiornate",
      preferences: {
        subscribed: updated.status === "ACTIVE",
        trackingConsent: updated.trackingConsent,
      },
    });
  } catch (error) {
    console.error("Errore aggiornamento preferenze:", error);
    res
      .status(500)
      .json({ error: "Errore durante l'aggiornamento delle preferenze" });
  }
};
