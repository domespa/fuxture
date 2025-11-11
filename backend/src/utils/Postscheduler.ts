import cron from "node-cron";
import { prisma } from "../config/database";

export const checkScheduledPosts = async (): Promise<void> => {
  try {
    const now = new Date();

    // TROVIAMO I POST SCHEDULED
    const posts = await prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
      },
    });

    // SE NON CE NE SONO ESCI
    if (posts.length === 0) {
      return;
    }

    console.log(
      `\n🕐 [${now.toISOString()}] Trovati ${posts.length} post da pubblicare:`
    );

    // PUBBLICALI
    for (const post of posts) {
      try {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: "PUBLISHED",
            publishedAt: now,
          },
        });
        console.log(
          `  ✅ Pubblicato: "${
            post.title
          }" (era schedulato per ${post.scheduledAt?.toISOString()})`
        );
      } catch (error) {
        console.error(`  ❌ Errore pubblicazione post ${post.id}:`, error);
      }
    }

    console.log(`✨ Pubblicazione completata!\n`);
  } catch (error) {
    console.error("❌ Errore nel post scheduler:", error);
  }
};

// AVVIO CRON
// '* * * * *' = ogni minuto
// '*/5 * * * *' = ogni 5 minuti
// '0 * * * *' = ogni ora (al minuto 0)
export const startScheduler = (): void => {
  // OGNI MINUTO
  cron.schedule("* * * * *", async () => {
    await checkScheduledPosts();
  });
  console.log("📅 Post Scheduler avviato - controlla ogni minuto");
  console.log(
    "🌍 Timezone server:",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  console.log("🕐 Ora corrente server (UTC):", new Date().toISOString());
  console.log("");
};

// UTILITY PER TESTING
export const runSchedulerTest = async (): Promise<void> => {
  console.log("🔄 Esecuzione manuale scheduler...\n");
  await checkScheduledPosts();
};
