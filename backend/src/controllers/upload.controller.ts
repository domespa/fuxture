import { Request, Response } from "express";
import fs from "fs/promises";
import { processImage } from "../utils/imageProcessing";

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalname: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
  };
}

// ====================================================================================================== //
//                                   CONTROLLER: UPLOAD SINGOLO FILE
// ====================================================================================================== //
export async function uploadSingleImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // VERIFICHIAMO CHE MULTER ABBIA PRESO IL FILE
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Nessun file ricevuto",
      });
      return;
    }

    const uploadedFile = req.file;

    // PROCESSIAMO L'IMMAGINE
    let processedPath: string;
    try {
      processedPath = await processImage(uploadedFile.path);
    } catch (error) {
      await fs.unlink(uploadedFile.path).catch(() => undefined);
      throw error;
    }

    // OTTENIAMO LE INFO
    const stats = await fs.stat(processedPath);

    // COSTRUIAMO L'URL PUBBLICO
    const publicUrl = `/${processedPath.replace(/\\/g, "/")}`;

    // RESPONSE CON LE INFO
    const response: UploadResponse = {
      success: true,
      message: "Upload Done",
      data: {
        filename: uploadedFile.filename,
        originalname: uploadedFile.originalname,
        path: processedPath,
        url: publicUrl,
        size: stats.size,
        mimetype: uploadedFile.mimetype,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error upload:", error);
    res.status(500).json({
      success: false,
      message: "Error",
      error: error instanceof Error ? error.message : "Generic error",
    });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   CONTROLLER: UPLOAD MULTIPLO
// ====================================================================================================== //
export async function uploadMultiImages(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No one file uploaded",
      });
      return;
    }

    const uploadedFiles = req.files;
    const processedImages = [];
    const failed: string[] = [];

    // PROCESSIAMO OGNI FILE
    for (const file of uploadedFiles) {
      try {
        const processedPath = await processImage(file.path);
        const stats = await fs.stat(processedPath);
        const publicUrl = `/${processedPath.replace(/\\/g, "/")}`;

        processedImages.push({
          filename: file.filename,
          originalname: file.originalname,
          path: processedPath,
          url: publicUrl,
          size: stats.size,
          mimetype: file.mimetype,
        });
      } catch (error) {
        console.error(`Errore processing ${file.originalname}:`, error);
        failed.push(file.originalname);

        // Il file di partenza resta a terra se processImage fallisce a meta':
        // senza questa pulizia la cartella accumula scarti che nessuno
        // referenzia e nessuno cancella.
        await fs.unlink(file.path).catch(() => undefined);
      }
    }

    // Prima la risposta era sempre "success: true" anche quando tutti i file
    // fallivano: chi caricava vedeva "0 DONE!" senza sapere cosa fosse andato
    // storto ne' quali immagini mancassero.
    res.status(201).json({
      success: failed.length === 0,
      message: `${processedImages.length} immagini elaborate${
        failed.length > 0 ? `, ${failed.length} non riuscite` : ""
      }`,
      data: processedImages,
      ...(failed.length > 0 && { failed }),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error",
      error: error instanceof Error ? error.message : "Error generic",
    });
  }
}
// ====================================================================================================== //
// ====================================================================================================== //
