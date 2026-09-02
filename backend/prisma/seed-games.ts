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
    leaderboard: "DAILY" as const,
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
    leaderboard: "ALL_TIME" as const,
    seoTitle: "Riflessi - test di velocita di reazione online",
    seoDescription:
      "Metti alla prova i tuoi riflessi: 30 secondi per colpire piu bersagli possibile. Gioco gratis da browser, anche da telefono.",
    tags: ["riflessi", "arcade", "veloce"],
    order: 2,
  },
  {
    slug: "fuxtrix",
    title: "Fuxtrix",
    description:
      "Incastra i blocchi che cadono e completa le righe prima che la pila arrivi in cima.",
    instructions:
      "Da computer: frecce sinistra e destra per muovere, freccia su per ruotare, freccia giu per scendere piu in fretta, barra spaziatrice per far cadere il pezzo di colpo, P per la pausa.\nDa telefono: usa i tasti sotto al campo, oppure trascina il dito sul campo per muovere, verso il basso per far cadere e tocca per ruotare.\nOgni 10 righe completate sali di livello e i pezzi scendono piu veloci. Quattro righe in una volta valgono molto piu di quattro righe singole.",
    entryPath: "fuxtrix",
    leaderboard: "ALL_TIME" as const,
    seoTitle: "Fuxtrix - gioco di blocchi che cadono, online e gratis",
    seoDescription:
      "Incastra i blocchi, completa le righe e scala la classifica. Gioco gratis da browser, senza registrazione, anche da telefono.",
    tags: ["arcade", "blocchi", "classico"],
    order: 3,
  },
];

async function main() {
  for (const game of games) {
    const result = await prisma.game.upsert({
      where: { slug: game.slug },
      update: { leaderboard: game.leaderboard },
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
