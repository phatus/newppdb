const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating all student statuses...");

  // Update all students to VERIFIED
  await prisma.student.updateMany({
    data: {
      statusVerifikasi: "VERIFIED",
    }
  });

  // Also update documents to VERIFIED
  await prisma.documents.updateMany({
    data: {
      statusAkta: "VERIFIED",
      statusKK: "VERIFIED",
      statusSKL: "VERIFIED",
      statusRaport: "VERIFIED",
      statusPasFoto: "VERIFIED",
    }
  });

  // Get all students sorted by NISN
  const students = await prisma.student.findMany({
    orderBy: { nisn: "asc" }
  });

  console.log(`Total students updated: ${students.length}`);

  // Set first 7 as LULUS, remaining as TIDAK_LULUS
  for (let i = 0; i < students.length; i++) {
    const isLulus = i < 7;
    const statusKelulusan = isLulus ? "LULUS" : "TIDAK_LULUS";
    const catatan = isLulus ? null : "Tidak memenuhi kriteria kelulusan minimal / kuota terpilih.";

    await prisma.student.update({
      where: { id: students[i].id },
      data: {
        statusKelulusan: statusKelulusan,
        catatanPenolakan: catatan,
      }
    });

    console.log(`  - ${students[i].namaLengkap}: Verifikasi=VERIFIED, Kelulusan=${statusKelulusan}`);
  }

  const acceptedCount = await prisma.student.count({ where: { statusKelulusan: "LULUS" } });
  const rejectedCount = await prisma.student.count({ where: { statusKelulusan: "TIDAK_LULUS" } });

  console.log(`\n✅ Summary: Total = ${students.length} | Diterima (LULUS) = ${acceptedCount} | Tidak Diterima = ${rejectedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
