import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            namaLengkap,
            nisn,
            gender,
            tempatLahir,
            tanggalLahir,
            asalSekolah,
            alamatLengkap,
            kota,
            kecamatan
        } = body;

        if (!namaLengkap || !nisn) {
            return NextResponse.json({ message: "Nama Lengkap and NISN are required" }, { status: 400 });
        }

        // Check duplicate NISN
        const existingStudent = await db.student.findUnique({
            where: { nisn },
        });

        if (existingStudent) {
            return NextResponse.json({ message: "NISN has already been registered" }, { status: 409 });
        }

        // Combine address parts
        const fullAddress = [alamatLengkap, kecamatan, kota].filter(Boolean).join(", ");

        const student = await db.student.create({
            data: {
                userId: session.user.id,
                namaLengkap,
                nisn,
                gender,
                tempatLahir,
                tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
                asalSekolah,
                alamatLengkap: fullAddress,
                statusVerifikasi: "PENDING",
            },
        });

        return NextResponse.json({ message: "Student created successfully", student }, { status: 201 });

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
