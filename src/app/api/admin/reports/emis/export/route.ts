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

        const settings = await db.schoolSettings.findFirst();
        const targetAcademicYear = academicYear && academicYear !== "all" ? academicYear : (settings?.academicYear || "2026/2027");

        const students = await db.student.findMany({
            where: {
                statusVerifikasi: "VERIFIED",
                statusKelulusan: "LULUS",
                academicYear: targetAcademicYear,
            },
            orderBy: {
                namaLengkap: "asc",
            },
            select: {
                id: true,
                namaLengkap: true,
                nisn: true,
                nik: true,
                noKk: true,
                gender: true,
                tempatLahir: true,
                tanggalLahir: true,
                asalSekolah: true,
                jalur: true,
                namaAyah: true,
                pekerjaanAyah: true,
                namaIbu: true,
                pekerjaanIbu: true,
                penghasilanOrtu: true,
                alamatJalan: true,
                alamatRt: true,
                alamatRw: true,
                alamatDesa: true,
                alamatKecamatan: true,
                alamatKabupaten: true,
                alamatProvinsi: true,
                kodePos: true,
                telepon: true,
            }
        });

        const exportData = students.map((s, index) => ({
            "No": index + 1,
            "Nama Lengkap": s.namaLengkap,
            "NISN": s.nisn,
            "NIK": s.nik || "-",
            "No KK": s.noKk || "-",
            "Jenis Kelamin": s.gender || "-",
            "Tempat Lahir": s.tempatLahir || "-",
            "Tanggal Lahir": s.tanggalLahir ? new Date(s.tanggalLahir).toLocaleDateString("id-ID") : "-",
            "Asal Sekolah": s.asalSekolah || "-",
            "Nama Ayah": s.namaAyah || "-",
            "Pekerjaan Ayah": s.pekerjaanAyah || "-",
            "Nama Ibu": s.namaIbu || "-",
            "Pekerjaan Ibu": s.pekerjaanIbu || "-",
            "Penghasilan Ortu": s.penghasilanOrtu || "-",
            "Alamat Jalan": s.alamatJalan || "-",
            "RT": s.alamatRt || "-",
            "RW": s.alamatRw || "-",
            "Desa/Kelurahan": s.alamatDesa || "-",
            "Kecamatan": s.alamatKecamatan || "-",
            "Kabupaten/Kota": s.alamatKabupaten || "-",
            "Provinsi": s.alamatProvinsi || "-",
            "Kode Pos": s.kodePos || "-",
            "Telepon": s.telepon || "-",
            "Jalur Pendaftaran": s.jalur
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data EMIS");

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        const filename = `Data_Murid_EMIS_${new Date().toISOString().split('T')[0]}.xlsx`;

        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("EMIS export error:", error);
        return new NextResponse("Export Error", { status: 500 });
    }
}
