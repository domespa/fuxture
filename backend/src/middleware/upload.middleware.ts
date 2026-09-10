import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import crypto from "crypto";

// ====================================================================================================== //
//                                    MIDDLEWARE: CONFIGURAZIONE
// ====================================================================================================== //

// Multer non crea la cartella di destinazione: su un ambiente appena
// installato - o dopo un deploy con filesystem effimero - il primo upload
// falliva con ENOENT. La si crea all'avvio, una volta sola.
const UPLOAD_DIR = "uploads/images";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  // SCEGLIAMO DOVE SALVARE
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  // COME RINOMINARE
  filename: (req, file, cb) => {
    // RANDOM NOME
    const uniqueName = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// FUNZIONE PER VALIDIARE I FILE
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // ESTESIONI ACCETTATE
  const allowedExt = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedExt.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Type file not supported. Have to be JPEG, PNG, WebP and GIF")
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
// ====================================================================================================== //
// ====================================================================================================== //
