import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const academicYear = searchParams.get("academicYear");
        const classId = searchParams.get("classId");

        const settings = await db.schoolSettings.findFirst();
        const targetYear = academicYear && academicYear !== "all" ? academicYear : (settings?.academicYear || "2026/2027");

        const whereClause: any = { academicYear: targetYear };
        if (classId && classId !== "all") {
            whereClause.id = classId;
        }

        const classes = await db.orientationClass.findMany({
            where: whereClause,
            orderBy: { name: "asc" },
            include: {
                students: {
                    orderBy: { namaLengkap: "asc" },
                    select: {
                        nisn: true,
                        namaLengkap: true,
                        gender: true,
                        asalSekolah: true,
                        jalur: true,
                    }
                }
            }
        });

        if (classes.length === 0) {
            return new NextResponse("Tidak ada data kelas untuk diexport", { status: 400 });
        }

        const workbook = XLSX.utils.book_new();

        // 1. Rekap Summary Sheet
        const summaryRows = classes.map((c, index) => {
            const males = c.students.filter(s => s.gender?.toUpperCase().startsWith("L")).length;
            const females = c.students.length - males;
            return [
                index + 1,
                c.name,
                males,
                females,
                c.students.length,
                c.capacity
            ];
        });

        const summaryHeader = ["No", "Nama Kelas", "Laki-Laki (L)", "Perempuan (P)", "Total Siswa", "Kapasitas Maksimal"];
        const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Rekap Kelas");

        // 2. Sheet per Class
        classes.forEach(c => {
            const classRows = c.students.map((s, idx) => [
                idx + 1,
                s.nisn || "-",
                s.namaLengkap,
                s.gender?.toUpperCase().startsWith("L") ? "Laki-laki" : "Perempuan",
                s.asalSekolah || "-",
                s.jalur || "-"
            ]);

            const classHeader = ["No", "NISN", "Nama Lengkap", "Jenis Kelamin", "Asal Sekolah", "Jalur Pendaftaran"];
            const classSheet = XLSX.utils.aoa_to_sheet([classHeader, ...classRows]);
            
            // Clean sheet name (max 31 chars in excel)
            const sheetName = c.name.substring(0, 30);
            XLSX.utils.book_append_sheet(workbook, classSheet, sheetName);
        });

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        const fileName = `rekap_kelas_matsama_${targetYear.replace("/", "-")}.xlsx`;

        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error: unknown) {
        console.error("Error exporting orientation classes Excel:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
