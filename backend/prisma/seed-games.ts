import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ====================================================================================================== //
//        Crea i due giochi interni gia presenti nel registry del frontend.
//        Lanciare con: npm run seed:games
// ====================================================================================================== //
const games = [
  {
    slug: "parola-del-giorno",
    title: "Parola del Giorno",
    description:
      "Indovina la parola italiana di 5 lettere in 6 tentativi. Una nuova parola ogni giorno.",
    instructions:
      "Scrivi una parola di 5 lettere e premi INVIO.\nVerde: lettera giusta al posto giusto.\nGiallo: lettera presente ma in un altra posizione.\nGrigio: lettera non presente nella parola.\nHai 6 tentativi e ogni giorno a mezzanotte cambia la parola.",
    entryPath: "parola-del-giorno",
    seoTitle: "Parola del Giorno - il gioco di parole italiano gratis",
    seoDescription:
      "Indovina la parola di 5 lettere del giorno. Gioco di parole italiano gratis, senza registrazione, anche da telefono.",
    tags: ["parole", "quotidiano", "logica"],
    order: 1,
  },
  {
    slug: "riflessi",
    title: "Riflessi",
    description:
      "Colpisci piu bersagli che puoi in 30 secondi, ma evita le bombe.",
    instructions:
      "Clicca o tocca i cerchi verdi appena compaiono: piu sei veloce, piu punti prendi.\nLe bombe rosse tolgono 5 punti.\nLa partita dura 30 secondi e i bersagli diventano sempre piu piccoli e veloci.",
    entryPath: "riflessi",
    seoTitle: "Riflessi - test di velocita di reazione online",
    seoDescription:
      "Metti alla prova i tuoi riflessi: 30 secondi per colpire piu bersagli possibile. Gioco gratis da browser, anche da telefono.",
    tags: ["riflessi", "arcade", "veloce"],
    order: 2,
  },
];

async function main() {
  for (const game of games) {
    const result = await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: {
        ...game,
        type: "INTERNAL",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    console.log(`OK ${result.slug} (${result.status})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
