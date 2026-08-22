const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating academicYear to '2026/2027' across database...");

  // Update SchoolSettings
  const settings = await prisma.schoolSettings.findFirst();
  if (settings) {
    await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: { academicYear: "2026/2027" }
    });
  } else {
    await prisma.schoolSettings.create({
      data: { academicYear: "2026/2027" }
    });
  }

  // Update all Wave records
  const waveRes = await prisma.wave.updateMany({
    data: { academicYear: "2026/2027" }
  });

  // Update all Student records
  const studentRes = await prisma.student.updateMany({
    data: { academicYear: "2026/2027" }
  });

  console.log(`✅ Updated SchoolSettings to '2026/2027'`);
  console.log(`✅ Updated ${waveRes.count} Waves and ${studentRes.count} Students to academicYear = '2026/2027'`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
