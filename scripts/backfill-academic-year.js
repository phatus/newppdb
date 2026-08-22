const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Backfilling academicYear for existing Wave and Student records...");

  const settings = await prisma.schoolSettings.findFirst();
  const currentAcademicYear = settings?.academicYear || "2025/2026";

  const waveResult = await prisma.wave.updateMany({
    where: { academicYear: null },
    data: { academicYear: currentAcademicYear }
  });

  const studentResult = await prisma.student.updateMany({
    where: { academicYear: null },
    data: { academicYear: currentAcademicYear }
  });

  console.log(`✅ Backfilled ${waveResult.count} Wave records and ${studentResult.count} Student records with academicYear = '${currentAcademicYear}'`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
