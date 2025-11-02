import { Request, Response } from "express";
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
  res: Response
): Promise<void> {
  try {
    // VERIFICHIAMO CHE MULTER ABBIA PRESO IL FILE
    if (!req.file) {
      res.status(400).json({
        success: false,
        messagge: "File miss",
      });
      return;
    }

    const uploadedFile = req.file;

    // PROCESSIAMO L'IMMAGINE
    const processedPath = await processImage(uploadedFile.path);

    // OTTENIAMO LE INFO
    const fs = require("fs");
    const stats = fs.statSync(processedPath);

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
  res: Response
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

    // PROCESSIAMO OGNI FILE
    for (const file of uploadedFiles) {
      try {
        const processedPath = await processImage(file.path);
        const fs = require("fs");
        const stats = fs.statSync(processedPath);
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
      }
    }

    res.status(201).json({
      success: true,
      message: `${processedImages.length} DONE!`,
      data: processedImages,
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
