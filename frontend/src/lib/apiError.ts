import { isAxiosError } from "axios";

// ============================================================================
// LETTURA DEGLI ERRORI DELL'API
//
// Ogni pagina ripeteva la stessa riga, con la stessa scorciatoia:
//
//   } catch (error: any) {
//     setError(error.response?.data?.message || "Errore ...");
//
// Il tipo any spegneva ogni controllo su una variabile che a runtime puo'
// essere qualunque cosa - un errore di rete senza response, un TypeError
// arrivato da tutt'altro punto - e faceva fallire il catch stesso con
// "cannot read property of undefined". In piu' il backend non e' coerente:
// alcuni controller rispondono { error }, altri { message }, i middleware di
// validazione un array { errors }. Chi leggeva solo .message vedeva il
// messaggio di ripiego anche quando il server aveva spiegato il problema.
// ============================================================================

type ApiErrorBody = {
  error?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }> | string[];
};

const readBody = (error: unknown): ApiErrorBody | undefined => {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data;
  return typeof data === "object" && data !== null
    ? (data as ApiErrorBody)
    : undefined;
};

// MESSAGGIO DA MOSTRARE ALL'UTENTE
export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const body = readBody(error);

  if (body?.error) return body.error;
  if (body?.message) return body.message;

  // Gli array di validazione: si mostra il primo, gli altri emergeranno al
  // tentativo successivo.
  const first = body?.errors?.[0];
  if (typeof first === "string") return first;
  if (first?.message) return first.message;

  return fallback;
};

// ERRORI DI VALIDAZIONE PER CAMPO, per i form che li mostrano sotto l'input.
// Restituisce una mappa vuota quando il server non ne ha inviati.
export const getApiFieldErrors = (
  error: unknown
): Record<string, string> => {
  const body = readBody(error);
  const fieldErrors: Record<string, string> = {};

  if (!Array.isArray(body?.errors)) return fieldErrors;

  for (const entry of body.errors) {
    if (typeof entry !== "string" && entry?.field) {
      fieldErrors[entry.field] = entry.message;
    }
  }

  return fieldErrors;
};
