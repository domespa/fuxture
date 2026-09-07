import { Request, Response } from "express";
import { prisma } from "../config/database";
import type { Prisma } from "@prisma/client";

// ====================================================================================================== //
//                                        RUBRICA CONTATTI
//
// Raccoglie gli indirizzi usati negli invii manuali - anteprime ed email di
// test - per non doverli riscrivere ogni volta.
//
// Non e' una lista di distribuzione. Le persone che finiscono qui non hanno
// prestato alcun consenso a ricevere comunicazioni promozionali, e le
// campagne pescano esclusivamente da Subscriber. La separazione e'
// deliberata: unire le due cose significherebbe spedire pubblicita' a chi non
// l'ha mai chiesta.
// ====================================================================================================== //

// REGISTRA UN INDIRIZZO APPENA USATO.
// Non solleva mai: la rubrica e' una comodita', e un suo problema non deve
// far fallire l'invio, che e' l'operazione che conta.
export const rememberContact = async (
  email: string,
  name?: string
): Promise<void> => {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes("@")) return;

  try {
    await prisma.contact.upsert({
      where: { email: clean },
      create: {
        email: clean,
        name: name?.trim() || null,
      },
      update: {
        lastUsedAt: new Date(),
        timesUsed: { increment: 1 },
        ...(name?.trim() ? { name: name.trim() } : {}),
      },
    });
  } catch (error) {
    console.error("⚠️ Impossibile aggiornare la rubrica:", error);
  }
};

// ELENCO
// GET /contacts?search=&limit=
export const getContacts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search } = req.query;
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? 50), 10) || 50, 1),
      200
    );

    const where: Prisma.ContactWhereInput = {};

    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.OR = [
        { email: { contains: term, mode: "insensitive" } },
        { name: { contains: term, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { lastUsedAt: "desc" },
      take: limit,
    });

    res.status(200).json({ success: true, data: { contacts } });
  } catch (error) {
    console.error("Errore recupero rubrica:", error);
    res.status(500).json({ error: "Errore durante il recupero della rubrica" });
  }
};

// AGGIORNA NOME O NOTA
// PATCH /contacts/:id
export const updateContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, note } = req.body;

    const existing = await prisma.contact.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Contatto non trovato" });
      return;
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() || null }),
        ...(note !== undefined && { note: String(note).trim() || null }),
      },
    });

    res.status(200).json({ success: true, data: { contact } });
  } catch (error) {
    console.error("Errore aggiornamento contatto:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento" });
  }
};

// ELIMINA
// DELETE /contacts/:id
export const deleteContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.contact.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Contatto non trovato" });
      return;
    }

    await prisma.contact.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Contatto eliminato" });
  } catch (error) {
    console.error("Errore eliminazione contatto:", error);
    res.status(500).json({ error: "Errore durante l'eliminazione" });
  }
};
