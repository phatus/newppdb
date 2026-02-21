import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";

async function handler(req: Request, session: any, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const studentId = params.id;

        // Verify the student belongs to the logged-in user
        const existingStudent = await db.student.findUnique({
            where: {
                id: studentId,
            },
        });

        if (!existingStudent) {
            return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
        }

        // We use email-based session, so we need to check if user email matches student's user email
        const user = await db.user.findUnique({
            where: { email: session.email }
        });

        if (!user || existingStudent.userId !== user.id) {
            return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
        }

        // Combine address parts for alamatLengkap
        const fullAddress = [
            body.alamatJalan,
            body.alamatRt ? `RT ${body.alamatRt}` : "",
            body.alamatRw ? `RW ${body.alamatRw}` : "",
            body.alamatDesa,
            body.alamatKecamatan,
            body.alamatKabupaten
        ].filter(Boolean).join(", ");

        const updatedStudent = await db.student.update({
            where: {
                id: studentId,
            },
            data: {
                namaLengkap: body.namaLengkap,
                nisn: body.nisn,
                nik: body.nik,
                noKk: body.noKk,
                gender: body.gender,
                tempatLahir: body.tempatLahir,
                tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
                asalSekolah: body.asalSekolah,
                namaAyah: body.namaAyah,
                pekerjaanAyah: body.pekerjaanAyah,
                namaIbu: body.namaIbu,
                pekerjaanIbu: body.pekerjaanIbu,
                penghasilanOrtu: body.penghasilanOrtu,
                alamatJalan: body.alamatJalan,
                alamatRt: body.alamatRt,
                alamatRw: body.alamatRw,
                alamatDesa: body.alamatDesa,
                alamatKecamatan: body.alamatKecamatan,
                alamatKabupaten: body.alamatKabupaten,
                alamatProvinsi: body.alamatProvinsi,
                kodePos: body.kodePos,
                alamatLengkap: fullAddress,
                jalur: body.jalur,
                telepon: body.telepon,
                waveId: body.waveId,
            },
        });

        return NextResponse.json({
            message: "Data siswa Berhasil diperbarui",
            student: updatedStudent
        });

    } catch (error) {
        console.error("API Update Student Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request, context: any) {
    return withAuth(req, (req, session) => handler(req, session, context));
}

export async function GET(req: Request, context: any) {
    return withAuth(req, async (req, session) => {
        const studentId = context.params.id;
        const user = await db.user.findUnique({ where: { email: session.email } });

        const student = await db.student.findUnique({
            where: { id: studentId },
            include: { documents: true, grades: true }
        });

        if (!student || student.userId !== user?.id) {
            return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json(student);
    });
}
