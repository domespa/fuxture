export const emailConfig = {
  email: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    },
    from: {
      email: process.env.SMTP_FROM_EMAIL || "noreply@example.com",
      name: process.env.SMTP_FROM_NAME || "My Blog",
    },
    batch: {
      size: parseInt(process.env.SMTP_BATCH_SIZE || "50", 10),
      delayMs: parseInt(process.env.SMTP_BATCH_DELAY || "1000", 10),
    },
  },
};
