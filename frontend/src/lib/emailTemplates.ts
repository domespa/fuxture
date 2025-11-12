// GDPR
export const getGDPRFooter = (): string => {
  return `
<p style="text-align: center;">Se non visualizzi correttamente questo messaggio <a href="{{web_version_url}}" target="_blank">guarda la versione web</a></p>

<hr>

<p style="text-align: center;">Questa email ti è stata inviata dal titolare del trattamento Spampinato Domenico, Carlentini 96013 P.IVA IT01937400891 <a href="mailto:info@fuxture.net">info@fuxture.net</a> perchè hai partecipato ad una delle nostre iniziative o perchè sei iscritto a Fuxture.<br>
Il messaggio è stato inviato alla tua email in ottemperanza al GDPR Reg. UE 679/06. Per cancellarti, clicca sul seguente <a href="{{unsubscribe_url}}">link</a>. Puoi prendere visione dell'informativa privacy cliccando <a href="https://fuxture.net/privacy-policy/">qui</a>.<br></p>
`;
};

// WRAP
export const wrapEmailHTML = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    ${content}
    </body>
    </html>
    `.trim();
};
