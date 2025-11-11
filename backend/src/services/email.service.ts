import nodemailer from "nodemailer";
import { emailConfig } from "../config/config.email";
import { prisma } from "../config/database";
import {
  SendEmailOptions,
  EmailSendResult,
  SendBatchEmailOptions,
  BatchEmailResult,
} from "../types/email.types";
import { EmailStatus } from "../generated/prisma";

// TRANSPORTER
const transporter = nodemailer.createTransport({
  host: emailConfig.email.smtp.host,
  port: emailConfig.email.smtp.port,
  secure: emailConfig.email.smtp.secure,
  auth: {
    user: emailConfig.email.smtp.auth.user,
    pass: emailConfig.email.smtp.auth.pass,
  },
});

// CHECK CONNESSIONE ALL'AVVIO
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
    return false;
  }
};

// FUNZIONE PER INVIARE SINGOLA EMAIL
export const sendEmail = async (
  options: SendEmailOptions
): Promise<EmailSendResult> => {
  const startTime = Date.now();

  try {
    const mailOptions = {
      from: `"${options.fromName || emailConfig.email.from.name}" <${
        emailConfig.email.from.email
      }>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    // INVIA
    const info = await transporter.sendMail(mailOptions);

    console.log(
      `✅ Email sent to ${options.to} - MessageId: ${info.messageId}`
    );

    // SALVA LOG
    const emailLog = await prisma.emailLog.create({
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
        ...(options.campaignId && { campaignId: options.campaignId }),
        ...(options.subscriberId && { subscriberId: options.subscriberId }),
      },
    });

    return {
      success: true,
      messageId: info.messageId,
      emailLog,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Failed to send email to ${options.to}:`, errorMessage);

    let emailLog;
    if (options.subscriberId || options.campaignId) {
      emailLog = await prisma.emailLog.create({
        data: {
          status: EmailStatus.FAILED,
          sentAt: new Date(),
          errorMessage,
          ...(options.campaignId && { campaignId: options.campaignId }),
          ...(options.subscriberId && { subscriberId: options.subscriberId }),
        },
      });
    }

    return {
      success: false,
      error: errorMessage,
      emailLog,
    };
  }
};

// FUNZIONE PER INVIARE MULTIEMAIL
export const sendBatchEmails = async (
  options: SendBatchEmailOptions
): Promise<BatchEmailResult> => {
  const startTime = Date.now();
  const results: EmailSendResult[] = [];
  let sent = 0;
  let failed = 0;

  const { recipients, subject, html, fromName, campaignId } = options;
  const batchSize = emailConfig.email.batch.size;
  const batchDelay = emailConfig.email.batch.delayMs;

  console.log(
    `📧 Starting batch email send: ${recipients.length} recipients, batch size: ${batchSize}`
  );

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(recipients.length / batchSize);

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches}...`);

    const batchPromises = batch.map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject,
        html,
        fromName,
        campaignId,
        subscriberId: recipient.subscriberId,
      })
    );

    // DEVE INVIARLE TUTTE
    const batchResults = await Promise.all(batchPromises);

    // RISULTATI
    results.push(...batchResults);

    // QUANTE A BUON FINE
    batchResults.forEach((result) => {
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    });

    console.log(
      `✅ Batch ${batchNumber}/${totalBatches} completed: ${
        batchResults.filter((r) => r.success).length
      } sent, ${batchResults.filter((r) => !r.success).length} failed`
    );

    // ASPETTIAMO
    if (i + batchSize < recipients.length) {
      console.log(`⏳ Waiting ${batchDelay}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  const duration = Date.now() - startTime;

  console.log(
    `🎉 Batch completed! Total: ${
      recipients.length
    }, Sent: ${sent}, Failed: ${failed}, Duration: ${(duration / 1000).toFixed(
      2
    )}s`
  );

  return {
    total: recipients.length,
    sent,
    failed,
    results,
    duration,
  };
};

// CREAZIONE TEMPLATE
export const createEmailTemplate = (content: string): string => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      background-color: #4F46E5;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      color: #4F46E5;
      margin-top: 0;
    }
    .email-body p {
      margin: 15px 0;
    }
    .email-body a {
      color: #4F46E5;
      text-decoration: none;
    }
    .email-body img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 15px 0;
    }
    .email-footer {
      background-color: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .email-footer a {
      color: #4F46E5;
      text-decoration: none;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      margin: 20px 0;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${emailConfig.email.from.name}</h1>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>Hai ricevuto questa email perché sei iscritto alla nostra newsletter.</p>
      <p><a href="{{unsubscribe_url}}">Annulla iscrizione</a></p>
      <p>&copy; ${new Date().getFullYear()} ${
    emailConfig.email.from.name
  }. Tutti i diritti riservati.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// EMAIL DI BENVENUTO
export const sendWelcomeEmail = async (
  subscriberEmail: string,
  subscriberName?: string
): Promise<EmailSendResult> => {
  const content = `
    <h2>Benvenuto nella nostra community! 🎉</h2>
    <p>Ciao ${subscriberName || ""},</p>
    <p>Grazie per esserti iscritto alla nostra newsletter! Siamo felici di averti con noi.</p>
    <p>Riceverai aggiornamenti regolari con:</p>
    <ul>
      <li>📝 Nuovi articoli del blog</li>
      <li>💡 Tips e consigli esclusivi</li>
      <li>🎁 Offerte speciali riservate agli iscritti</li>
    </ul>
    <p>A presto!</p>
  `;

  return sendEmail({
    to: subscriberEmail,
    subject: `Benvenuto su ${emailConfig.email.from.name}!`,
    html: createEmailTemplate(content),
  });
};

// CANCELLAZIONE NEWSLETTER
export const sendUnsubscribeConfirmationEmail = async (
  subscriberEmail: string,
  subscriberName?: string
): Promise<EmailSendResult> => {
  const content = `
    <h2>Cancellazione iscrizione confermata 👋</h2>
    <p>Ciao ${subscriberName || ""},</p>
    <p>La tua richiesta di cancellazione dalla newsletter è stata elaborata con successo.</p>
    <p>Non riceverai più email da parte nostra.</p>
    <p>Ci dispiace vederti andare via! Se hai un momento, ci piacerebbe sapere il motivo della tua cancellazione per migliorare il nostro servizio.</p>
    <p>Se hai cancellato per errore o cambi idea, puoi <a href="{{subscribe_url}}" class="btn">Iscriverti di nuovo</a></p>
    <p>Ti auguriamo il meglio!</p>
    <p style="margin-top: 30px; font-size: 12px; color: #666;">
      Questa è un'email di conferma automatica. Non è necessario rispondere.
    </p>
  `;

  return sendEmail({
    to: subscriberEmail,
    subject: "Cancellazione iscrizione confermata",
    html: createEmailTemplate(content),
  });
};
