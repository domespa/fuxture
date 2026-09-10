// ====================================================================================================== //
//                                        VARIABILI D'AMBIENTE
//
// Deve restare il PRIMO import del file. Diversi moduli leggono process.env
// al momento del caricamento - JWT_SECRET in utils/jwt, le credenziali SMTP
// in config/config.email - e gli import vengono eseguiti tutti prima di
// qualunque istruzione. Con dotenv.config() chiamato piu' in basso quei
// moduli funzionavano solo perche' config/database, che a sua volta invoca
// dotenv, capitava di essere caricato per primo lungo la catena degli import:
// bastava riordinare una riga per ritrovarsi senza segreti e senza errori.
import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import path from "path";
import postRoutes from "./routes/post.routes";
import commentRoutes from "./routes/comment.routes";
import { startScheduler } from "./utils/Postscheduler";
import addressBookRoutes from "./routes/address-book.routes";
import emailLogRoutes from "./routes/email-log.routes";
import { verifyEmailConnection } from "./services/email.service";
import subscriberRoutes from "./routes/subscriber.routes";
import campaignRoutes from "./routes/campaign.routes";
import emailListRoutes from "./routes/email-list.routes";
import categoryRoutes from "./routes/category.routes";
import newsRoutes from "./routes/news.routes";
import breakingNewsRoutes from "./routes/breaking-news.routes";
import contactRoutes from "./routes/contact.routes";
import gameRoutes from "./routes/game.routes";

const API_PREFIX = env.apiPrefix;
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                              SET SERVER
// ====================================================================================================== //

const app = express();
const PORT = env.port;
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());

// SU RENDER SIAMO DIETRO UN PROXY: SERVE PER LEGGERE L IP REALE (RATE LIMIT CLASSIFICHE)
app.set("trust proxy", 1);
app.use(
  cors({
    origin: [
      "https://fuxture.net",
      "https://www.fuxture.net",
      "https://fuxture.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                             MIDDLEWARE
// ====================================================================================================== //

// Le creativita' DEM di inserzionisti e agenzie sono HTML voluminosi: il
// singolo file supera i 200 KB, oltre il limite predefinito di 100 KB del body
// parser, che faceva fallire con 413 l'anteprima e il salvataggio delle
// campagne piu' grandi.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                              ROTTE
// ====================================================================================================== //
// AUTH
app.use(`${API_PREFIX}/auth`, authRoutes);

// UPLOAD FILE
app.use(`${API_PREFIX}/upload`, uploadRoutes);

// POSTS
app.use(`${API_PREFIX}/posts`, postRoutes);

// CATEGORIE
app.use(`${API_PREFIX}/categories`, categoryRoutes);

// COMMENTS
app.use(`${API_PREFIX}/comments`, commentRoutes);

// ISCRITTI
app.use(`${API_PREFIX}/subscribers`, subscriberRoutes);

// CAMPAGNE
app.use(`${API_PREFIX}/campaigns`, campaignRoutes);

// RUBRICA DEGLI INVII MANUALI (da non confondere con /contact, il form del sito)
app.use(`${API_PREFIX}/address-book`, addressBookRoutes);

// CRONOLOGIA INVII
app.use(`${API_PREFIX}/email-logs`, emailLogRoutes);

// LISTE ISCRITTI
app.use(`${API_PREFIX}/email-lists`, emailListRoutes);

// NEWS
app.use(`${API_PREFIX}`, newsRoutes);
app.use(`${API_PREFIX}/breaking-news`, breakingNewsRoutes);

// GIOCHI
app.use(`${API_PREFIX}/games`, gameRoutes);

// SEND EMAIL
app.use(`${API_PREFIX}/contact`, contactRoutes);

// CHECK SERVER
app.get("/", (req, res) => {
  res.json({
    message: "SIAMO ONLINE 😶‍🌫️",
    port: PORT,
    env: process.env.NODE_ENV,
    apiPrefix: API_PREFIX,
  });
});

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                    ROTTA INESISTENTE E GESTIONE ERRORI
//
// Mancavano entrambi. Una rotta sbagliata riceveva la pagina HTML di Express,
// e qualunque eccezione non catturata dentro un handler - per esempio quelle
// sollevate da multer sui file rifiutati - finiva nel gestore predefinito,
// che in sviluppo risponde con lo stack trace completo. Il client, che si
// aspetta JSON, in entrambi i casi falliva il parsing della risposta.
// ====================================================================================================== //

// 404: SOLO DOPO TUTTE LE ROTTE
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
});

// GESTORE ERRORI: DEVE AVERE QUATTRO PARAMETRI, ALTRIMENTI EXPRESS LO TRATTA
// COME UN MIDDLEWARE NORMALE E NON LO CHIAMA MAI
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(
    `❌ Errore non gestito su ${req.method} ${req.originalUrl}:`,
    err,
  );

  if (res.headersSent) return;

  res.status(500).json({
    error: "Internal server error",
    // Il dettaglio esce solo in sviluppo: in produzione un messaggio di
    // errore puo' rivelare percorsi, query e nomi di colonne.
    ...(process.env.NODE_ENV === "development" && { detail: err.message }),
  });
});
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                              AVVIO SERVER
// ====================================================================================================== //

app.listen(PORT, () => {
  console.log(`👍 Server running on http://localhost:${PORT}`);
  console.log(`😒 Siamo in ${process.env.NODE_ENV}`);
  console.log(`🔗 API routes mounted at: ${API_PREFIX}`);
  startScheduler();

  // La configurazione SMTP e' tutta su variabili d'ambiente, con valori di
  // ripiego fittizi (smtp.example.com): se in produzione mancano, l'invio
  // fallisce in silenzio. Meglio accorgersene all'avvio che da un destinatario
  // che non riceve nulla.
  if (!process.env.SMTP_HOST) {
    console.error(
      "❌ SMTP_HOST non configurato: nessuna email verra' recapitata",
    );
  }
  verifyEmailConnection();
});
// ====================================================================================================== //
// ====================================================================================================== //
