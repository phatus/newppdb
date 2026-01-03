import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            namaLengkap, nisn, nik, noKk, gender, tempatLahir, tanggalLahir, asalSekolah,
            namaAyah, pekerjaanAyah, namaIbu, pekerjaanIbu, penghasilanOrtu,
            alamatJalan, alamatRt, alamatRw, alamatDesa, alamatKecamatan, alamatKabupaten, alamatProvinsi, kodePos,
            jalur, telepon
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

        // Gabungkan Alamat for backwards compatibility if needed, or just use specific fields
        // We will store specific fields now. alamatLengkap can be a summary string.
        const fullAddress = `${alamatJalan}, RT ${alamatRt}/RW ${alamatRw}, ${alamatDesa}, ${alamatKecamatan}, ${alamatKabupaten}`;

        const newStudent = await db.student.create({
            data: {
                userId: session.user.id,
                namaLengkap,
                nisn,
                nik,
                noKk,
                gender: gender as string,
                tempatLahir,
                tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
                asalSekolah,

                // Parent Info
                namaAyah,
                pekerjaanAyah,
                namaIbu,
                pekerjaanIbu,
                penghasilanOrtu,

                // Address Info
                alamatJalan,
                alamatRt,
                alamatRw,
                alamatDesa,
                alamatKecamatan,
                alamatKabupaten,
                alamatProvinsi,
                kodePos,
                alamatLengkap: fullAddress, // Maintain backward comp if needed

                jalur: jalur || "REGULER", // Default to REGULER
                statusVerifikasi: "PENDING",
                telepon,
                waveId: body.waveId,
            },
        });

        // Send WhatsApp Notification
        if (telepon) {
            const message = `Halo ${namaLengkap}, pendaftaran Anda di PPDB Online telah berhasil. Silakan lengkapi dokumen dan nilai di dashboard. Terima kasih.`;
            await sendWhatsApp(telepon, message);
        }

        return NextResponse.json({ message: "Student created successfully", student: newStudent }, { status: 201 });

    } catch (error) {
        console.error("Create student error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const students = await db.student.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                documents: true,
                grades: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ students });

    } catch (error) {
        console.error("Fetch students error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
