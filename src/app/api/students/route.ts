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
        const { namaLengkap, nisn, gender, tempatLahir, tanggalLahir, asalSekolah, alamatLengkap, kota, kecamatan, jalur, telepon } = body;

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

        // Gabungkan Alamat
        const fullAddress = `${alamatLengkap}, ${kecamatan}, ${kota}`;

        const newStudent = await db.student.create({
            data: {
                userId: session.user.id,
                namaLengkap,
                nisn,
                gender: gender as string,
                tempatLahir,
                tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
                asalSekolah,
                alamatLengkap: fullAddress,
                jalur: jalur || "REGULER", // Default to REGULER
                statusVerifikasi: "PENDING",
                telepon,
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
