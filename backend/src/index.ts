import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import path from "path";
import postRoutes from "./routes/post.routes";
import commentRoutes from "./routes/comment.routes";
import { startScheduler } from "./utils/Postscheduler";
import subscriberRoutes from "./routes/subscriber.routes";
import campaignRoutes from "./routes/campaign.routes";
import emailListRoutes from "./routes/email-list.routes";
import categoryRoutes from "./routes/category.routes";
import newsRoutes from "./routes/news.routes";

// ====================================================================================================== //
//                                              VARIABILI D'AMBIENTE
// ====================================================================================================== //
import dotenv from "dotenv";
dotenv.config();
const API_PREFIX = process.env.API_PREFIX || "/api";
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                              SET SERVER
// ====================================================================================================== //

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                             MIDDLEWARE
// ====================================================================================================== //

app.use(express.json());
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
app.use("/api/categories", categoryRoutes);

// COMMENTS
app.use(`${API_PREFIX}/comments`, commentRoutes);

// ISCRITTI
app.use(`${API_PREFIX}/subscribers`, subscriberRoutes);

// CAMPAGNE
app.use(`${API_PREFIX}/campaigns`, campaignRoutes);

// LISTE ISCRITTI
app.use(`${API_PREFIX}/email-lists`, emailListRoutes);

// NEWS
app.use(`${API_PREFIX}`, newsRoutes);

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
//                                              AVVIO SERVER
// ====================================================================================================== //

app.listen(PORT, () => {
  console.log(`👍 Server running on http://localhost:${PORT}`);
  console.log(`😒 Siamo in ${process.env.NODE_ENV}`);
  console.log(`🔗 API routes mounted at: ${API_PREFIX}`);
  startScheduler();
});
// ====================================================================================================== //
// ====================================================================================================== //
