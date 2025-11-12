import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  CreateEmailListRequest,
  UpdateEmailListRequest,
  AddSubscribersToListRequest,
  EmailListResponse,
  EmailListDetailResponse,
} from "../types/email-list.types";

// ====================================================================================================== //
//                                    CONTROLLER: CREA LISTA
// ====================================================================================================== //
export const createEmailList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      isPublic = true,
    } = req.body as CreateEmailListRequest;

    // CHECK SE NOME ESISTE
    const existingList = await prisma.emailList.findUnique({
      where: { name },
    });

    if (existingList) {
      res.status(409).json({ message: "List name already exists" });
      return;
    }

    // CREA LISTA
    const newList = await prisma.emailList.create({
      data: {
        name,
        description: description || null,
        isPublic,
      },
    });

    const response: EmailListResponse = {
      id: newList.id,
      name: newList.name,
      description: newList.description,
      isPublic: newList.isPublic,
      subscriberCount: 0,
      createdAt: newList.createdAt,
      updatedAt: newList.updatedAt,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating email list:", error);
    res.status(500).json({ message: "Failed to create email list" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI TUTTE LE LISTE
// ====================================================================================================== //
export const getEmailLists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lists = await prisma.emailList.findMany({
      include: {
        _count: {
          select: { subscribers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response: EmailListResponse[] = lists.map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      isPublic: list.isPublic,
      subscriberCount: list._count.subscribers,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching email lists:", error);
    res.status(500).json({ message: "Failed to fetch email lists" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI SINGOLA LISTA
// ====================================================================================================== //
export const getEmailListById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const list = await prisma.emailList.findUnique({
      where: { id },
      include: {
        subscribers: {
          include: {
            subscriber: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { subscribedAt: "desc" },
        },
      },
    });

    if (!list) {
      res.status(404).json({ message: "Email list not found" });
      return;
    }

    const response: EmailListDetailResponse = {
      id: list.id,
      name: list.name,
      description: list.description,
      isPublic: list.isPublic,
      subscriberCount: list.subscribers.length,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      subscribers: list.subscribers.map((sub) => ({
        id: sub.subscriber.id,
        email: sub.subscriber.email,
        name: sub.subscriber.name,
        subscribedAt: sub.subscribedAt,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching email list:", error);
    res.status(500).json({ message: "Failed to fetch email list" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: AGGIORNA LISTA
// ====================================================================================================== //
export const updateEmailList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body as UpdateEmailListRequest;

    // CHECK SE ESISTE
    const existingList = await prisma.emailList.findUnique({
      where: { id },
    });

    if (!existingList) {
      res.status(404).json({ message: "Email list not found" });
      return;
    }

    // DUPLICATI
    if (name && name !== existingList.name) {
      const duplicateName = await prisma.emailList.findUnique({
        where: { name },
      });

      if (duplicateName) {
        res.status(409).json({ message: "List name already exists" });
        return;
      }
    }
    const updatedList = await prisma.emailList.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        _count: {
          select: { subscribers: true },
        },
      },
    });

    const response: EmailListResponse = {
      id: updatedList.id,
      name: updatedList.name,
      description: updatedList.description,
      isPublic: updatedList.isPublic,
      subscriberCount: updatedList._count.subscribers,
      createdAt: updatedList.createdAt,
      updatedAt: updatedList.updatedAt,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating email list:", error);
    res.status(500).json({ message: "Failed to update email list" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: ELIMINA LISTA
// ====================================================================================================== //
export const deleteEmailList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // CHECK SE ESISTE
    const existingList = await prisma.emailList.findUnique({
      where: { id },
    });

    if (!existingList) {
      res.status(404).json({ message: "Email list not found" });
      return;
    }

    // DELETE CASCADE
    await prisma.emailList.delete({
      where: { id },
    });

    res.status(200).json({ message: "Email list deleted successfully" });
  } catch (error) {
    console.error("Error deleting email list:", error);
    res.status(500).json({ message: "Failed to delete email list" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: AGGIUNGI SUBS ALLA LISTA
// ====================================================================================================== //
export const addSubscribersToList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { listId } = req.params;
    const { subscriberIds } = req.body as AddSubscribersToListRequest;

    // CHECK SE ESISTE
    const list = await prisma.emailList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      res.status(404).json({ message: "Email list not found" });
      return;
    }

    // CHECK SE SUBS ESISTONO
    const existingSubscribers = await prisma.subscriber.findMany({
      where: {
        id: { in: subscriberIds },
      },
      select: { id: true },
    });

    const existingIds = existingSubscribers.map((sub) => sub.id);
    const invalidIds = subscriberIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      res.status(400).json({
        message: "Some subscriber IDs are invalid",
        invalidIds,
      });
      return;
    }

    // QUINDI AGGIUNGIAMO ALLA LISTA
    const result = await prisma.subscriberList.createMany({
      data: subscriberIds.map((subscriberId) => ({
        subscriberId,
        listId,
      })),
      skipDuplicates: true, // IGNORIAMO SE ESISTONO
    });

    res.status(200).json({
      message: "Subscribers added to list successfully",
      addedCount: result.count,
    });
  } catch (error) {
    console.error("Error adding subscribers to list:", error);
    res.status(500).json({ message: "Failed to add subscribers to list" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: RIMUOV SUB ALLA LISTA
// ====================================================================================================== //
export const removeSubscriberFromList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { listId, subscriberId } = req.params;

    // CHECK SE RELAZIONE ESISTE
    const relation = await prisma.subscriberList.findFirst({
      where: {
        listId,
        subscriberId,
      },
    });

    if (!relation) {
      res.status(404).json({ message: "Subscriber not found in this list" });
      return;
    }

    // RIMUOVI SELEZIONE
    await prisma.subscriberList.delete({
      where: { id: relation.id },
    });

    res
      .status(200)
      .json({ message: "Subscriber removed from list successfully" });
  } catch (error) {
    console.error("Error removing subscriber from list:", error);
    res.status(500).json({ message: "Failed to remove subscriber from list" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    CONTROLLER: OTTIENI TUTTI I SUB
// ====================================================================================================== //
export const getListSubscribers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { listId } = req.params;

    // CHECK SE LISTA ESISTE
    const list = await prisma.emailList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      res.status(404).json({ message: "Email list not found" });
      return;
    }

    // RECUPER SUBS
    const subscribers = await prisma.subscriberList.findMany({
      where: { listId },
      include: {
        subscriber: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { subscribedAt: "desc" },
    });

    const response = subscribers.map((sub) => ({
      id: sub.subscriber.id,
      email: sub.subscriber.email,
      name: sub.subscriber.name,
      status: sub.subscriber.status,
      subscribedAt: sub.subscribedAt,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching list subscribers:", error);
    res.status(500).json({ message: "Failed to fetch list subscribers" });
  }
};
// ====================================================================================================== //
// ====================================================================================================== //
