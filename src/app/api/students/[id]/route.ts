import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const resolvedParams = await params;

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const student = await db.student.findUnique({
            where: {
                id: resolvedParams.id,
                userId: session.user.id,
            },
        });

        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Get student error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const resolvedParams = await params;

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Check ownership
        const existingStudent = await db.student.findUnique({
            where: {
                id: resolvedParams.id,
                userId: session.user.id,
            },
        });

        if (!existingStudent) {
            return NextResponse.json({ message: "Student not found or access denied" }, { status: 404 });
        }

        // Combine address parts
        const fullAddress = [body.alamatJalan, "RT " + body.alamatRt, "RW " + body.alamatRw, body.alamatDesa, body.alamatKecamatan, body.alamatKabupaten].filter(Boolean).join(", ");

        const updatedStudent = await db.student.update({
            where: {
                id: resolvedParams.id,
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

                // Parent Info
                namaAyah: body.namaAyah,
                pekerjaanAyah: body.pekerjaanAyah,
                namaIbu: body.namaIbu,
                pekerjaanIbu: body.pekerjaanIbu,
                penghasilanOrtu: body.penghasilanOrtu,

                // Address Info
                alamatJalan: body.alamatJalan,
                alamatRt: body.alamatRt,
                alamatRw: body.alamatRw,
                alamatDesa: body.alamatDesa,
                alamatKecamatan: body.alamatKecamatan,
                alamatKabupaten: body.alamatKabupaten,
                alamatProvinsi: body.alamatProvinsi,
                kodePos: body.kodePos,
                alamatLengkap: fullAddress,

                jalur: body.jalur || undefined, // Only update if provided
                telepon: body.telepon,
            },
        });

        return NextResponse.json(updatedStudent);
    } catch (error) {
        console.error("Update student error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        // Await params properly in Next.js 15+ (if applicable) or generally safe practice
        const resolvedParams = await params;

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const studentId = resolvedParams.id;

        // Verify the student belongs to the logged-in user
        const student = await db.student.findUnique({
            where: {
                id: studentId,
                userId: session.user.id,
            },
        });

        if (!student) {
            return NextResponse.json({ message: "Student not found or access denied" }, { status: 404 });
        }

        // Delete the student
        await db.student.delete({
            where: {
                id: studentId,
            },
        });

        return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Delete student error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
