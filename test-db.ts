import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const settings = await db.schoolSettings.findFirst();
  console.log("SETTINGS:", JSON.stringify(settings, null, 2));

  const students = await db.student.findMany({
    where: { statusVerifikasi: 'VERIFIED' },
    include: { grades: true },
    take: 5
  });
  console.log("STUDENTS:", JSON.stringify(students, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
