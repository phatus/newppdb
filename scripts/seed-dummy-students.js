const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting dummy data seeding...");

  // 1. Create or ensure active Wave exists
  let wave = await prisma.wave.findFirst({ where: { isActive: true } });
  if (!wave) {
    wave = await prisma.wave.create({
      data: {
        name: "Gelombang 1 Utama",
        description: "Pendaftaran PPDB Gelombang 1 TA 2026/2027",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-08-31"),
        isActive: true,
        isResultsPublished: true,
        showRanking: true,
        quota: 100,
        jalurAllowed: ["REGULER", "PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK", "AFIRMASI"],
        pathQuotas: { REGULER: 50, PRESTASI_AKADEMIK: 20, PRESTASI_NON_AKADEMIK: 15, AFIRMASI: 15 }
      }
    });
    console.log("✅ Wave created:", wave.name);
  }

  // 2. Sample student data list
  const dummyStudents = [
    {
      name: "Ahmad Rizky Pratama",
      email: "ahmad.rizky@example.com",
      gender: "L",
      asalSekolah: "SDN 1 Pacitan",
      jalur: "REGULER",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "LULUS",
      nisn: "0081234501",
      nik: "3501011505080001",
      rapor: 88.5,
      teori: 85.0,
      skua: 90.0,
      catatanPenolakan: null,
    },
    {
      name: "Siti Nur Aini",
      email: "siti.nuraini@example.com",
      gender: "P",
      asalSekolah: "MI Negeri 1 Pacitan",
      jalur: "PRESTASI_AKADEMIK",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "LULUS",
      nisn: "0081234502",
      nik: "3501015206080002",
      rapor: 94.2,
      teori: 92.0,
      skua: 95.0,
      catatanPenolakan: null,
    },
    {
      name: "Bagas Satria Wijaya",
      email: "bagas.satria@example.com",
      gender: "L",
      asalSekolah: "SDN 2 Kebonagung",
      jalur: "PRESTASI_NON_AKADEMIK",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "LULUS",
      nisn: "0081234503",
      nik: "3501021004080003",
      rapor: 82.0,
      teori: 80.0,
      skua: 85.0,
      catatanPenolakan: null,
    },
    {
      name: "Dewi Rahmawati",
      email: "dewi.rahmawati@example.com",
      gender: "P",
      asalSekolah: "MI Muhammadiyah 2 Pacitan",
      jalur: "AFIRMASI",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "LULUS",
      nisn: "0081234504",
      nik: "3501014809080004",
      rapor: 86.0,
      teori: 84.0,
      skua: 88.0,
      catatanPenolakan: null,
    },
    {
      name: "Muhammad Fajar Shodiq",
      email: "fajar.shodiq@example.com",
      gender: "L",
      asalSekolah: "SDN 3 Arjosari",
      jalur: "REGULER",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "LULUS",
      nisn: "0081234505",
      nik: "3501031201080005",
      rapor: 85.5,
      teori: 88.0,
      skua: 82.0,
      catatanPenolakan: null,
    },
    {
      name: "Budi Santoso",
      email: "budi.santoso@example.com",
      gender: "L",
      asalSekolah: "SDN 1 Tegalombo",
      jalur: "REGULER",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "TIDAK_LULUS",
      nisn: "0081234506",
      nik: "3501041803080006",
      rapor: 65.0,
      teori: 60.0,
      skua: 62.0,
      catatanPenolakan: "Nilai ujian akhir di bawah batas kualifikasi kelulusan reguler.",
    },
    {
      name: "Anisa Fitriani",
      email: "anisa.fitriani@example.com",
      gender: "P",
      asalSekolah: "MI Terpadu Al-Huda",
      jalur: "PRESTASI_AKADEMIK",
      statusVerifikasi: "VERIFIED",
      statusKelulusan: "TIDAK_LULUS",
      nisn: "0081234507",
      nik: "3501016507080007",
      rapor: 72.0,
      teori: 68.0,
      skua: 70.0,
      catatanPenolakan: "Kuota jalur prestasi akademik penuh dan skor tidak memenuhi ambang batas.",
    },
    {
      name: "Doni Kurniawan",
      email: "doni.kurniawan@example.com",
      gender: "L",
      asalSekolah: "SDN 2 Nawangan",
      jalur: "REGULER",
      statusVerifikasi: "REJECTED",
      statusKelulusan: "TIDAK_LULUS",
      nisn: "0081234508",
      nik: "3501052211080008",
      rapor: 70.0,
      teori: 65.0,
      skua: 68.0,
      catatanPenolakan: "Foto Kartu Keluarga buram dan nilai rapor tidak valid/lengkap.",
    },
    {
      name: "Rina Kusuma",
      email: "rina.kusuma@example.com",
      gender: "P",
      asalSekolah: "SDN 1 Punung",
      jalur: "AFIRMASI",
      statusVerifikasi: "REJECTED",
      statusKelulusan: "TIDAK_LULUS",
      nisn: "0081234509",
      nik: "3501065902080009",
      rapor: 74.0,
      teori: 70.0,
      skua: 72.0,
      catatanPenolakan: "Surat Keterangan Tidak Mampu (SKTM) tidak dapat diverifikasi keasliannya.",
    },
    {
      name: "Dimas Anggara",
      email: "dimas.anggara@example.com",
      gender: "L",
      asalSekolah: "SDN 1 Donorojo",
      jalur: "REGULER",
      statusVerifikasi: "PENDING",
      statusKelulusan: "PENDING",
      nisn: "0081234510",
      nik: "3501071408080010",
      rapor: 80.0,
      teori: 78.0,
      skua: 81.0,
      catatanPenolakan: null,
    },
    {
      name: "Nabila Putri Utama",
      email: "nabila.putri@example.com",
      gender: "P",
      asalSekolah: "MI Al-Hikmah Pacitan",
      jalur: "PRESTASI_AKADEMIK",
      statusVerifikasi: "PENDING",
      statusKelulusan: "PENDING",
      nisn: "0081234511",
      nik: "3501014112080011",
      rapor: 91.0,
      teori: 89.0,
      skua: 90.0,
      catatanPenolakan: null,
    },
    {
      name: "Rizky Ramadhan",
      email: "rizky.ramadhan@example.com",
      gender: "L",
      asalSekolah: "SDN 2 Sudimoro",
      jalur: "REGULER",
      statusVerifikasi: "PENDING",
      statusKelulusan: "PENDING",
      nisn: "0081234512",
      nik: "3501080304080012",
      rapor: 83.0,
      teori: 82.0,
      skua: 84.0,
      catatanPenolakan: null,
    }
  ];

  const defaultPassword = await bcrypt.hash("siswa123", 12);
  const now = new Date();

  for (let index = 0; index < dummyStudents.length; index++) {
    const s = dummyStudents[index];

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        password: defaultPassword,
        role: "USER",
        emailVerified: now,
      },
      create: {
        email: s.email,
        name: s.name,
        password: defaultPassword,
        role: "USER",
        emailVerified: now,
      }
    });

    // Calculate final score
    const finalScore = Number(((s.rapor * 0.4) + (s.teori * 0.3) + (s.skua * 0.3)).toFixed(2));

    // Upsert student
    const existingStudent = await prisma.student.findUnique({ where: { nisn: s.nisn } });
    let student;
    if (existingStudent) {
      student = await prisma.student.update({
        where: { nisn: s.nisn },
        data: {
          namaLengkap: s.name,
          gender: s.gender,
          tempatLahir: "Pacitan",
          tanggalLahir: new Date("2012-05-15"),
          asalSekolah: s.asalSekolah,
          alamatLengkap: "Jl. Lintas Selatan No. " + (index + 1) + ", Pacitan",
          jalur: s.jalur,
          statusVerifikasi: s.statusVerifikasi,
          statusKelulusan: s.statusKelulusan,
          catatanPenolakan: s.catatanPenolakan,
          nomorUjian: "PPDB-2026-" + String(index + 101).padStart(3, '0'),
          telepon: "0812345678" + String(index).padStart(2, '0'),
          waveId: wave.id,
        }
      });
    } else {
      student = await prisma.student.create({
        data: {
          userId: user.id,
          namaLengkap: s.name,
          nisn: s.nisn,
          nik: s.nik,
          gender: s.gender,
          tempatLahir: "Pacitan",
          tanggalLahir: new Date("2012-05-15"),
          jenjang: s.asalSekolah.startsWith("MI") ? "MI" : "SD",
          asalSekolah: s.asalSekolah,
          alamatLengkap: "Jl. Lintas Selatan No. " + (index + 1) + ", Pacitan",
          jalur: s.jalur,
          statusVerifikasi: s.statusVerifikasi,
          statusKelulusan: s.statusKelulusan,
          catatanPenolakan: s.catatanPenolakan,
          nomorUjian: "PPDB-2026-" + String(index + 101).padStart(3, '0'),
          telepon: "0812345678" + String(index).padStart(2, '0'),
          waveId: wave.id,
          namaAyah: "Bapak " + s.name.split(" ")[0],
          pekerjaanAyah: "Wiraswasta",
          namaIbu: "Ibu " + s.name.split(" ")[0],
          pekerjaanIbu: "Ibu Rumah Tangga",
          penghasilanOrtu: "2.000.000 - 5.000.000",
        }
      });
    }

    // Upsert grades
    await prisma.grades.upsert({
      where: { studentId: student.id },
      update: {
        rataRataNilai: s.rapor,
        nilaiUjianTeori: s.teori,
        nilaiUjianSKUA: s.skua,
        finalScore: finalScore,
      },
      create: {
        studentId: student.id,
        rataRataNilai: s.rapor,
        nilaiUjianTeori: s.teori,
        nilaiUjianSKUA: s.skua,
        finalScore: finalScore,
      }
    });

    // Upsert documents
    const docStatus = s.statusVerifikasi === "REJECTED" ? "REJECTED" : (s.statusVerifikasi === "VERIFIED" ? "VERIFIED" : "PENDING");
    await prisma.documents.upsert({
      where: { studentId: student.id },
      update: {
        statusAkta: docStatus,
        statusKK: docStatus,
        statusSKL: docStatus,
        statusRaport: docStatus,
        statusPasFoto: docStatus,
      },
      create: {
        studentId: student.id,
        statusAkta: docStatus,
        statusKK: docStatus,
        statusSKL: docStatus,
        statusRaport: docStatus,
        statusPasFoto: docStatus,
      }
    });

    console.log(`  [${index + 1}/${dummyStudents.length}] ${s.name} (${s.jalur}) - Verifikasi: ${s.statusVerifikasi}, Kelulusan: ${s.statusKelulusan}`);
  }

  console.log("🎉 Dummy data seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding dummy data:", e);
  })
  .finally(() => prisma.$disconnect());
