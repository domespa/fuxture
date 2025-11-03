import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

// ====================================================================================================== //
//                                   FUNZIONE PER OTTIMIZZARE L'IMMAGINE
// ====================================================================================================== //
export async function processImage(
  inputPath: string,
  outputPath?: string,
  options: ImageProcessingOptions = {}
): Promise<string> {
  // VALORI DI DEFAULT
  const { maxWidth = 1920, maxHeight = 1080, quality = 80, format } = options;

  // SOVRASCRIVIAMO SE NON SPECIFICHIAMO
  const finalOutputPath = outputPath || inputPath;

  try {
    // LEGGIAMO I METADATI
    const metadata = await sharp(inputPath).metadata();

    // INIZIALIZZIAMO SHARP CON IL FILE
    let pipeline = sharp(inputPath);

    // FACCIAMO UN RESIZE SE L'IMMAGINE SUPERA I LIMITI
    if (
      (metadata.width && metadata.width > maxWidth) ||
      (metadata.height && metadata.height > maxHeight)
    ) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // CONVERTIAMO IL FORMATO SE RICHIESTO
    if (format) {
      switch (format) {
        case "jpeg":
          pipeline = pipeline.jpeg({ quality });
          break;
        case "png":
          pipeline = pipeline.png({ quality });
          break;
        case "webp":
          pipeline = pipeline.webp({ quality });
          break;
      }
    } else {
      // OTTIMIZZIAMO IL FORMATO SE NON CONVERTIAMO
      if (metadata.format === "jpeg" || metadata.format === "jpg") {
        pipeline = pipeline.jpeg({ quality });
      } else if (metadata.format === "png") {
        pipeline = pipeline.png({ quality });
      } else if (metadata.format === "webp") {
        pipeline = pipeline.webp({ quality });
      }
    }

    // Usiamo un file temporaneo se input === output
    if (finalOutputPath === inputPath) {
      const tempPath = `${inputPath}.tmp`;

      // Salviamo nel file temporaneo
      await pipeline.toFile(tempPath);

      // Cancelliamo l'originale
      await fs.unlink(inputPath);

      // Rinominiamo il temp con il nome originale
      await fs.rename(tempPath, inputPath);

      return inputPath;
    } else {
      // Se input e output sono diversi, procediamo normalmente
      await pipeline.toFile(finalOutputPath);

      // Eliminiamo il file originale
      await fs.unlink(inputPath);

      return finalOutputPath;
    }
  } catch (error) {
    console.error("Error processing IMAGE:", error);
    throw new Error("Impossible to convert");
  }
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                   HELPER PER THUMBNAIL
// ====================================================================================================== //
export async function createThumbnail(
  inputPath: string,
  size: number = 300
): Promise<string> {
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  const dirname = path.dirname(inputPath);
  const thumbnailPath = path.join(dirname, `${basename}-thumb${ext}`);

  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error("Errore creazione thumbnail:", error);
    throw new Error("Impossibile creare thumbnail");
  }
}
// ====================================================================================================== //
// ====================================================================================================== //
