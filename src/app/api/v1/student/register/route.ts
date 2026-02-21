import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";

async function handler(req: Request, session: any) {
    try {
        const body = await req.json();
        const {
            namaLengkap, nisn, nik, noKk, gender, tempatLahir, tanggalLahir, asalSekolah,
            namaAyah, pekerjaanAyah, namaIbu, pekerjaanIbu, penghasilanOrtu,
            alamatJalan, alamatRt, alamatRw, alamatDesa, alamatKecamatan, alamatKabupaten, alamatProvinsi, kodePos,
            jalur, telepon, waveId
        } = body;

        // Validasi input dasar
        if (!namaLengkap || !nisn) {
            return NextResponse.json(
                { message: "Nama Lengkap dan NISN wajib diisi" },
                { status: 400 }
            );
        }

        // Cek NISN duplikat
        const existingStudent = await db.student.findUnique({
            where: { nisn },
        });

        if (existingStudent) {
            return NextResponse.json(
                { message: "NISN sudah terdaftar" },
                { status: 400 }
            );
        }

        // Cek NIK Duplikat if NIK is provided
        if (nik) {
            const existingNik = await db.student.findUnique({
                where: { nik },
            });
            if (existingNik) {
                return NextResponse.json(
                    { message: "NIK sudah terdaftar" },
                    { status: 400 }
                );
            }
        }

        const fullAddress = `${alamatJalan}, RT ${alamatRt}/RW ${alamatRw}, ${alamatDesa}, ${alamatKecamatan}, ${alamatKabupaten}`;

        // Lookup user by email to get the stable DB ID
        const user = await db.user.findUnique({
            where: { email: session.email }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const newStudent = await db.student.create({
            data: {
                userId: user.id,
                namaLengkap,
                nisn,
                nik,
                noKk,
                gender,
                tempatLahir,
                tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
                asalSekolah,
                namaAyah,
                pekerjaanAyah,
                namaIbu,
                pekerjaanIbu,
                penghasilanOrtu,
                alamatJalan,
                alamatRt,
                alamatRw,
                alamatDesa,
                alamatKecamatan,
                alamatKabupaten,
                alamatProvinsi,
                kodePos,
                alamatLengkap: fullAddress,
                jalur: jalur || "REGULER",
                statusVerifikasi: "PENDING",
                telepon,
                waveId,
            },
        });

        // Send WhatsApp Notification
        if (telepon) {
            const message = `Halo ${namaLengkap}, pendaftaran Anda di PMBM Online telah berhasil (via App). Silakan lengkapi dokumen dan nilai. Terima kasih.`;
            await sendWhatsApp(telepon, message);
        }

        return NextResponse.json({
            message: "Student created successfully",
            student: newStudent
        }, { status: 201 });

    } catch (error) {
        console.error("API Student Register Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return withAuth(req, handler);
}
