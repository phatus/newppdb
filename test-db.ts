import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const settings = await db.schoolSettings.findFirst();
  console.log("SETTINGS pathWeights:", JSON.stringify(settings?.pathWeights, null, 2));

  const students = await db.student.findMany({
    where: { 
        statusVerifikasi: 'VERIFIED',
        jalur: { in: ['PRESTASI_AKADEMIK', 'PRESTASI_NON_AKADEMIK'] }
    },
    include: { grades: true },
    take: 5
  });

  const pathDefaults = {
    "REGULER": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
    "AFIRMASI": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
    "PRESTASI_AKADEMIK": { rapor: 30, ujian: 30, skua: 30, prestasi: 10 },
    "PRESTASI_NON_AKADEMIK": { rapor: 0, ujian: 30, skua: 30, prestasi: 40 },
  };

  const pathWeights: any = settings?.pathWeights || {};

  students.forEach(s => {
      const specificWeights = pathWeights[s.jalur];
      const defaultW = (pathDefaults as any)[s.jalur];
      
      const wRapor = (specificWeights?.rapor ?? defaultW.rapor) / 100;
      const wUjian = (specificWeights?.ujian ?? defaultW.ujian) / 100;
      const wSKUA = (specificWeights?.skua ?? defaultW.skua) / 100;

      const avgReport = s.grades?.rataRataNilai || 0;
      const theory = s.grades?.nilaiUjianTeori || 0;
      const skua = s.grades?.nilaiUjianSKUA || 0;
      const achievement = s.grades?.nilaiPrestasi || 0;

      const baseScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA);
      const finalScore = baseScore + achievement;

      console.log(`Student: ${s.namaLengkap} (${s.jalur})`);
      console.log(`  Grades: rapor=${avgReport}, teori=${theory}, skua=${skua}, pres=${achievement}`);
      console.log(`  Weights: wRapor=${wRapor}, wUjian=${wUjian}, wSKUA=${wSKUA}`);
      console.log(`  Calc base=${baseScore}, final=${finalScore}, DB finalScore=${s.grades?.finalScore}`);
  });
}
main().catch(console.error).finally(() => db.$disconnect());
