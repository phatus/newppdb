"use server";

import { db } from "@/lib/db";

export async function validateDocument(regNo: string) {
    if (!regNo) {
        return { success: false, error: "Nomor Registrasi wajib diisi" };
    }

    try {
        // Find student where the ID starts with the registration number
        // Since we display the first 8 characters of the ID as the Reg No
        const student = await db.student.findFirst({
            where: {
                id: {
                    startsWith: regNo,
                    mode: 'insensitive', // Case insensitive search
                },
            },
            select: {
                id: true,
                namaLengkap: true,
                nisn: true,
                asalSekolah: true,
                statusVerifikasi: true,
                jalur: true,
                createdAt: true,
            },
        });

        if (!student) {
            return { success: false, error: "Data registrasi tidak ditemukan" };
        }

        return {
            success: true,
            data: {
                ...student,
                regNo: student.id.substring(0, 8).toUpperCase(),
            },
        };
    } catch (error) {
        console.error("Error validating document:", error);
        return { success: false, error: "Terjadi kesalahan sistem saat memvalidasi" };
    }
}
