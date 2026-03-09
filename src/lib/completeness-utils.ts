export function checkStudentCompleteness(student: any, requiredSemesterCount: number = 5): { isComplete: boolean; missing: string[] } {
    const missing: string[] = [];
    const docs = student.documents;

    // 1. Check Biodata (Simplified for Admin - only name and nisn)
    if (!student.namaLengkap) missing.push("Nama Lengkap");
    if (!student.nisn) missing.push("NISN");

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
    // Grade requirement follows active semesters setting
    const gradeCount = student.grades?.semesterGrades?.length || 0;
    if (gradeCount < requiredSemesterCount) {
        missing.push(`Nilai Raport (${gradeCount}/${requiredSemesterCount} Semester)`);
    }

    return {
        isComplete: missing.length === 0,
        missing
    };
}
