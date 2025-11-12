import { Request, Response, NextFunction } from "express";
import { CampaignStatus } from "../generated/prisma";

// ====================================================================================================== //
//                                VALIDAZIONE CREAZIONE CAMPAGNA
// ====================================================================================================== //
export function validateCreateCampaign(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { subject, content, fromName, status, scheduledAt, listIds } = req.body;
  const errors: { field: string; message: string }[] = [];

  // SUBJECT
  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    errors.push({
      field: "subject",
      message: "Subject is required and must be a non-empty string",
    });
  } else if (subject.trim().length < 3) {
    errors.push({
      field: "subject",
      message: "Subject must be at least 3 characters long",
    });
  } else if (subject.trim().length > 200) {
    errors.push({
      field: "subject",
      message: "Subject must not exceed 200 characters",
    });
  }

  // CONTENT
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Content is required and must be a non-empty string",
    });
  } else if (content.trim().length < 10) {
    errors.push({
      field: "content",
      message: "Content must be at least 10 characters long",
    });
  }

  // FROMNAME
  if (fromName !== undefined && fromName !== null) {
    if (typeof fromName !== "string" || fromName.trim().length < 2) {
      errors.push({
        field: "fromName",
        message: "From name must be at least 2 characters long",
      });
    } else if (fromName.trim().length > 100) {
      errors.push({
        field: "fromName",
        message: "From name must not exceed 100 characters",
      });
    }
  }

  // LISTID
  if (listIds !== undefined) {
    if (!Array.isArray(listIds)) {
      errors.push({ field: "listIds", message: "listIds must be an array" });
    } else if (
      listIds.length > 0 &&
      !listIds.every((id) => typeof id === "string" && id.length > 0)
    ) {
      errors.push({
        field: "listIds",
        message: "All listIds must be valid strings",
      });
    }
  }

  // STATUS
  const validStatuses = Object.values(CampaignStatus);
  if (status !== undefined) {
    if (!validStatuses.includes(status)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }
  }

  // SCHEDULEDAT
  const campaignStatus = status || CampaignStatus.DRAFT;

  if (campaignStatus === CampaignStatus.SCHEDULED) {
    if (!scheduledAt) {
      errors.push({
        field: "scheduledAt",
        message: "scheduledAt is required when status is SCHEDULED",
      });
    } else {
      const scheduledDate = new Date(scheduledAt);

      // Verifica che sia una data valida
      if (isNaN(scheduledDate.getTime())) {
        errors.push({
          field: "scheduledAt",
          message: "scheduledAt must be a valid ISO date string",
        });
      } else {
        // Verifica che sia nel futuro
        const now = new Date();
        if (scheduledDate <= now) {
          errors.push({
            field: "scheduledAt",
            message: "scheduledAt must be a future date",
          });
        }
      }
    }
  }

  // RITORNA 400 SE CI SONO ERRORI
  if (errors.length > 0) {
    res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
    return;
  }

  next();
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                              VALIDAZIONE AGGIORNAMENTO CAMPAGNA
// ====================================================================================================== //
export function validateUpdateCampaign(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { subject, content, fromName, status, scheduledAt } = req.body;
  const errors: { field: string; message: string }[] = [];

  // ALMENO UN CAMPO DEVE ESSERE PRESENTE
  if (
    subject === undefined &&
    content === undefined &&
    fromName === undefined &&
    status === undefined &&
    scheduledAt === undefined
  ) {
    res.status(400).json({
      error: "At least one field must be provided for update",
    });
    return;
  }

  // SUBJECT
  if (subject !== undefined) {
    if (typeof subject !== "string" || subject.trim().length === 0) {
      errors.push({
        field: "subject",
        message: "Subject must be a non-empty string",
      });
    } else if (subject.trim().length < 3) {
      errors.push({
        field: "subject",
        message: "Subject must be at least 3 characters long",
      });
    } else if (subject.trim().length > 200) {
      errors.push({
        field: "subject",
        message: "Subject must not exceed 200 characters",
      });
    }
  }

  // CONTENT
  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length === 0) {
      errors.push({
        field: "content",
        message: "Content must be a non-empty string",
      });
    } else if (content.trim().length < 10) {
      errors.push({
        field: "content",
        message: "Content must be at least 10 characters long",
      });
    }
  }

  // FROMNAME
  if (fromName !== undefined && fromName !== null) {
    if (typeof fromName !== "string" || fromName.trim().length < 2) {
      errors.push({
        field: "fromName",
        message: "From name must be at least 2 characters long",
      });
    } else if (fromName.trim().length > 100) {
      errors.push({
        field: "fromName",
        message: "From name must not exceed 100 characters",
      });
    }
  }

  // STATUS
  const validStatuses = Object.values(CampaignStatus);
  if (status !== undefined) {
    if (!validStatuses.includes(status)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }
  }

  // SCHEDULEDAT
  if (status === CampaignStatus.SCHEDULED) {
    if (!scheduledAt) {
      errors.push({
        field: "scheduledAt",
        message: "scheduledAt is required when status is SCHEDULED",
      });
    } else {
      const scheduledDate = new Date(scheduledAt);

      if (isNaN(scheduledDate.getTime())) {
        errors.push({
          field: "scheduledAt",
          message: "scheduledAt must be a valid ISO date string",
        });
      } else {
        const now = new Date();
        if (scheduledDate <= now) {
          errors.push({
            field: "scheduledAt",
            message: "scheduledAt must be a future date",
          });
        }
      }
    }
  }

  // 400 SE ERRORI
  if (errors.length > 0) {
    res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
    return;
  }

  next();
}
// ====================================================================================================== //
// ====================================================================================================== //
