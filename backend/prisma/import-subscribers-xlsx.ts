import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();
const source = "form newsletter";
const importedFrom = "utenti_sintetici_1000.xlsx";
const consentText =
  "Consenso raccolto tramite form newsletter e importato per finalita di test.";

type Row = {
  Nome?: unknown;
  Cognome?: unknown;
  Email?: unknown;
  IP?: unknown;
};

const text = (value: unknown): string => String(value ?? "").trim();

async function main() {
  const workbook = XLSX.readFile("../docs/utenti_sintetici_1000.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });

  if (rows.length === 0) throw new Error("Il file Excel non contiene righe");

  let imported = 0;
  let skipped = 0;
  const now = new Date();

  for (const [index, row] of rows.entries()) {
    const firstName = text(row.Nome);
    const lastName = text(row.Cognome);
    const email = text(row.Email).toLowerCase();
    const ipAddress = text(row.IP);

    if (!firstName || !lastName || !email || !ipAddress) {
      skipped++;
      continue;
    }

    const consentAt = new Date(now);
    consentAt.setDate(now.getDate() - ((index % 30) + 1));
    consentAt.setHours(9 + (index % 8), index % 60, 0, 0);

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        source,
        subscribedAt: consentAt,
        consentAt,
        consentSource: source,
        consentText,
        consentIp: ipAddress,
        trackingConsent: true,
        trackingConsentAt: consentAt,
        metadata: { importedFrom, importedAt: consentAt.toISOString() },
      },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        status: "ACTIVE",
        subscribedAt: consentAt,
        source,
        consentAt,
        consentSource: source,
        consentText,
        consentIp: ipAddress,
        trackingConsent: true,
        trackingConsentAt: consentAt,
        metadata: { importedFrom, importedAt: consentAt.toISOString() },
      },
    });

    const existingLogs = await prisma.consentLog.findMany({
      where: { subscriberId: subscriber.id },
      select: { type: true },
    });
    const types = new Set(existingLogs.map((log) => log.type));
    await prisma.consentLog.updateMany({
      where: { subscriberId: subscriber.id },
      data: {
        text: consentText,
        source,
        ipAddress,
        userAgent: "Form newsletter",
        createdAt: consentAt,
      },
    });
    const missingTypes = (["NEWSLETTER", "TRACKING"] as const).filter(
      (type) => !types.has(type),
    );

    if (missingTypes.length) {
      await prisma.consentLog.createMany({
        data: missingTypes.map((type) => ({
          subscriberId: subscriber.id,
          type,
          granted: true,
          text: consentText,
          source,
          ipAddress,
          userAgent: "Import XLSX",
          createdAt: consentAt,
        })),
      });
    }
    imported++;
  }

  console.log(`Importate: ${imported}`);
  console.log(`Saltate per dati mancanti: ${skipped}`);
  console.log(`Fonte: ${source}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
