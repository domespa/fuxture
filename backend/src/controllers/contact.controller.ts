import { Request, Response } from "express";
import { sendEmail } from "../services/email.service";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// VALIDAZIONE DEL FORM
const validateContactForm = (data: ContactForm): string[] => {
  const errors: string[] = [];

  // NAME
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Il nome deve contenere almeno 2 caratteri");
  }

  // EMAIL
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Email non valida");
  }

  // SUBJECT
  if (!data.subject || data.subject.trim().length < 4) {
    errors.push("L'oggetto deve avere almeno 4 caratteri");
  }

  // MESSAGE
  if (!data.message || data.message.trim().length < 10) {
    errors.push("Il messaggio deve contenere almeno 10 caratteri");
  }
  return errors;
};

// SANITIZZAZIONE INPUT
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "").slice(0, 1000);
};

// CREAZIONE HTML
const createHTML = (data: ContactForm): string => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Messaggio dal Form Contatto</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #1f2937;
      display: block;
      margin-bottom: 5px;
    }
    .message-box {
      background-color: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 2px solid #3b82f6;
    }
    .message-box h3 {
      margin-top: 0;
      color: #1e40af;
    }
    .email-footer {
      background-color: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-top: 1px solid #e5e7eb;
    }
    .reply-button {
      display: inline-block;
      margin: 20px 0;
      padding: 12px 30px;
      background-color: #3b82f6;
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
      <h1>📧 Nuovo Messaggio dal Form Contatto</h1>
    </div>
    <div class="email-body">
      <p style="font-size: 16px; color: #059669; font-weight: bold;">
        🎉 Hai ricevuto un nuovo messaggio da <strong>${sanitizeInput(
          data.name
        )}</strong>!
      </p>

      <div class="info-box">
        <strong>👤 Nome:</strong>
        <p style="margin: 5px 0 0 0;">${sanitizeInput(data.name)}</p>
      </div>

      <div class="info-box">
        <strong>📧 Email:</strong>
        <p style="margin: 5px 0 0 0;">
          <a href="mailto:${
            data.email
          }" style="color: #3b82f6; text-decoration: none;">
            ${data.email}
          </a>
        </p>
      </div>

      <div class="info-box">
        <strong>📝 Oggetto:</strong>
        <p style="margin: 5px 0 0 0;">${sanitizeInput(data.subject)}</p>
      </div>

      <div class="message-box">
        <h3>💬 Messaggio:</h3>
        <p style="white-space: pre-wrap; margin: 0;">
          ${sanitizeInput(data.message)}
        </p>
      </div>

      <div style="text-align: center;">
        <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(
    sanitizeInput(data.subject)
  )}" class="reply-button">
          📮 Rispondi a ${sanitizeInput(data.name)}
        </a>
      </div>

      <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        <strong>📅 Data ricezione:</strong> ${new Date().toLocaleString(
          "it-IT",
          {
            dateStyle: "full",
            timeStyle: "short",
          }
        )}
      </p>
    </div>
    <div class="email-footer">
      <p>Questa è una notifica automatica dal tuo sito <strong>Fuxture</strong></p>
      <p>&copy; ${new Date().getFullYear()} Fuxture - Tutti i diritti riservati</p>
    </div>
  </div>
</body>
</html>
    `;
};

// ====================================================================================================== //
//                                    CONTROLLER: INVIA MESSAGGIO COTNATTO
// ====================================================================================================== //
export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // VALIDAZIONE
    const validationErrors = validateContactForm({
      name,
      email,
      subject,
      message,
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Errori di validazione",
        errors: validationErrors,
      });
    }

    const contactData: ContactForm = {
      name,
      email,
      subject,
      message,
    };

    // INVIA EMAIL ALL'ADMIN
    const emailToAdmin = await sendEmail({
      to: "info@fuxture.net",
      subject: `[CONTATTO SITO] ${sanitizeInput(subject)}`,
      html: createHTML(contactData),
    });

    if (!emailToAdmin.success) {
      console.error("❌ Errore invio email al titolare:", emailToAdmin.error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'invio del messaggio. Riprova più tardi.",
      });
    }

    // INVIO EMAIL DI CONFERMA ALL'UTENTE
    const confirtmationEmail = await sendEmail({
      to: email,
      subject: "✅ Messaggio ricevuto - Fuxture",
      html: createHTML(contactData),
    });

    // SE LA CONFERMA NON VA A BUON FINE, ANDIAMO AVANTI LO STESSO
    if (!confirtmationEmail.success) {
      console.warn(
        "⚠️ Email di conferma non inviata all'utente:",
        confirtmationEmail.error
      );

      console.log(
        `✅ Messaggio di contatto ricevuto da: ${email} - Oggetto: "${subject}"`
      );

      return res.status(200).json({
        success: true,
        message:
          "Messaggio inviato con successo! Ti risponderemo al più presto.",
      });
    }
  } catch (error) {
    console.error("❌ Errore nel controller contact:", error);
    return res.status(500).json({
      success: false,
      message: "Errore del server. Riprova più tardi.",
    });
  }
};
