export function checkStudentCompleteness(student: any, requiredSemesterCount: number = 5): { isComplete: boolean; missing: string[] } {
    const missing: string[] = [];
    const docs = student.documents;

    // 1. Check Biodata
    if (!student.namaLengkap) missing.push("Nama Lengkap");
    if (!student.nisn) missing.push("NISN");
    if (!student.nik) missing.push("NIK");
    if (!student.noKk) missing.push("No. KK");
    if (!student.gender) missing.push("Jenis Kelamin");
    if (!student.tempatLahir) missing.push("Tempat Lahir");
    if (!student.tanggalLahir) missing.push("Tanggal Lahir");
    if (!student.jenjang) missing.push("Jenjang Asal");
    if (!student.asalSekolah) missing.push("Asal Sekolah");

    // Parent Data
    if (!student.namaAyah) missing.push("Nama Ayah");
    if (!student.pekerjaanAyah) missing.push("Pekerjaan Ayah");
    if (!student.namaIbu) missing.push("Nama Ibu");
    if (!student.pekerjaanIbu) missing.push("Pekerjaan Ibu");
    if (!student.penghasilanOrtu) missing.push("Penghasilan Orang Tua");

    // Address Data
    if (!student.alamatJalan) missing.push("Jalan/Dusun");
    if (!student.alamatRt) missing.push("RT");
    if (!student.alamatRw) missing.push("RW");
    if (!student.alamatDesa) missing.push("Desa");
    if (!student.alamatKecamatan) missing.push("Kecamatan");
    if (!student.alamatKabupaten) missing.push("Kabupaten");
    if (!student.alamatProvinsi) missing.push("Provinsi");
    if (!student.kodePos) missing.push("Kode Pos");

    // Contact
    if (!student.telepon) missing.push("No. Telepon");

    // 2. Check Documents
    if (!docs?.fileKK) missing.push("Dokumen: Kartu Keluarga");
    if (!docs?.fileAkta) missing.push("Dokumen: Akta Kelahiran");
    if (!docs?.pasFoto) missing.push("Dokumen: Pas Foto");

    // Report Card (Required for ALL paths based on latest PMBM updates)
    if (!docs?.fileRaport) missing.push("Dokumen: Raport");

    // Path specific documents
    if (student.jalur === "AFIRMASI" && !docs?.fileSKTM) {
        missing.push("Dokumen: KIP/PKH/SKTM (Afirmasi)");
    }

    const isPrestasiPath = student.jalur === "PRESTASI_AKADEMIK" || student.jalur === "PRESTASI_NON_AKADEMIK";
    if (isPrestasiPath) {
        if (!docs?.filePrestasi || docs.filePrestasi.length === 0) {
            missing.push("Dokumen: Sertifikat Prestasi");
        }
    }

    // 3. Check Grades
    // All paths need grades now per recent PMBM updates (Reguler, Afirmasi, Prestasi)
    const gradeCount = student.grades?.semesterGrades?.length || 0;
    if (gradeCount < requiredSemesterCount) {
        missing.push(`Nilai Raport (${gradeCount}/${requiredSemesterCount} Semester)`);
    }

    return {
        isComplete: missing.length === 0,
        missing
    };
}
