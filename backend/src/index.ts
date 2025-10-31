import express from "express";

// VARIABILI D'AMBIENTE
//
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SIAMO ONLINE😶‍🌫️",
    port: PORT,
    env: process.env.NODE_ENV,
  });
});

app.listen(PORT, () => {
  console.log(`👍 Server running on http://localhost:${PORT}`);
  console.log(`😒 Siamo in ${process.env.NODE_ENV}`);
});
