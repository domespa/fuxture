import { prisma } from "../config/database";
// ====================================================================================================== //
//                                       GENERA SLUG DA STRINGA
// ====================================================================================================== //
export function generateSlug(text: string): string {
  return text
    .toLocaleLowerCase() // MINUSCOLO
    .normalize("NFD") // DECOMPONETE CARATTERI ACCENTATI
    .replace(/[\u0300-\u036f]/g, "") // RIMUOVE ACCENTI
    .replace(/[^a-z0-9\s-]/g, "") // RIMUOVE CARATTERI SPECIALI
    .trim() // RIMUOVE GLI SPAZI
    .replace(/\s+/g, "-") // SOSTITUISCE SPAZI CON TRATTINI
    .replace(/-+/g, "-") // SOSTITUISCE TRATTINI MULTIPLI CON UNO SOLO
    .replace(/^-+|-+$/g, ""); // RIMUOVE TRATTINI ALL'INIZIO E ALLA FINE
}

// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                       GENERA SLUG UNICO
// ====================================================================================================== //
export async function generateUniqueSlug(
  title: string,
  excludePostId?: string
): Promise<string> {
  // GENERA DAL TITOLO
  const baseSlug = generateSlug(title);

  // VEDIAMO SE PRIMA ESISTE
  const existSlug = await prisma.post.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },

      // ESCLUDI QUELLO ESISTENTE SE STIAMO MODIFICANDO
      ...(excludePostId && { id: { not: excludePostId } }),
    },
    select: {
      slug: true,
    },
  });

  // SE NON ESISTE
  if (existSlug.length === 0) {
    return baseSlug;
  }

  // ESTRAI NUMERI DA SLUG ESISTENTI
  const slugNumbers: number[] = existSlug
    .map((p) => {
      if (p.slug === baseSlug) {
        return 1;
      }

      const match = p.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num): num is number => num !== null);

  if (slugNumbers.length === 0) {
    return `${baseSlug}-2`;
  }

  // TROVA QUELLO PIU ALTO ED AGGIUNGI 1
  const maxNumber = Math.max(...slugNumbers);
  return `${baseSlug}-${maxNumber + 1}`;
}
// ====================================================================================================== //
// ====================================================================================================== //

// ====================================================================================================== //
//                                             VALIDAZIONE DELLO SLUG
// ====================================================================================================== //
export async function isSlugValid(
  slug: string,
  excludePostId?: string
): Promise<boolean> {
  // VERIFICHIAMO IL FORMAT
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    return false;
  }

  // VERIFICHIAMO CHE SIA UNICO
  const uniquePost = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  // NON ESISTE? ALLORA è DISPONIBILE
  if (!uniquePost) {
    return true;
  }

  if (excludePostId && uniquePost.id === excludePostId) {
    return true;
  }

  // FALSE PERCHè SE NO LO DUPLICA
  return false;
}
// ====================================================================================================== //
// ====================================================================================================== //
