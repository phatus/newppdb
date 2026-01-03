"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAcceptedStudentsForEmis() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        const students = await db.student.findMany({
            where: {
                statusVerifikasi: "VERIFIED", // Assuming we want verified students, or use statusKelulusan if available
                // statusKelulusan: "LULUS" (Optional: enable this if you only want explicitly graduated students)
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

                // Parent Info
                namaAyah: true,
                pekerjaanAyah: true,
                namaIbu: true,
                pekerjaanIbu: true,
                penghasilanOrtu: true,

                // Address Info
                alamatJalan: true,
                alamatRt: true,
                alamatRw: true,
                alamatDesa: true,
                alamatKecamatan: true,
                alamatKabupaten: true,
                alamatProvinsi: true,
                kodePos: true,
                telepon: true,

                // Needed for Photo Export
                nomorUjian: true,
                documents: {
                    select: {
                        pasFoto: true
                    }
                }
            }
        });

        return { success: true, data: students };
    } catch (error) {
        console.error("Error fetching EMIS data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
