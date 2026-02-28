
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const duplicates = await prisma.$queryRaw`
    SELECT "nomorUjian", COUNT(*)
    FROM "Student"
    WHERE "nomorUjian" IS NOT NULL
    GROUP BY "nomorUjian"
    HAVING COUNT(*) > 1
  `;

    console.log('Duplicate Exam Numbers:', duplicates);

    const allVerified = await prisma.student.findMany({
        where: { statusVerifikasi: 'VERIFIED' },
        select: { id: true, namaLengkap: true, nomorUjian: true },
        orderBy: { nomorUjian: 'asc' }
    });

    console.log('All Verified Students & Numbers:');
    allVerified.forEach(s => {
        console.log(`${s.nomorUjian} - ${s.namaLengkap} (${s.id})`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
