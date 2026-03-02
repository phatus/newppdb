"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { sendWhatsApp } from "@/lib/whatsapp";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function verifyStudent(studentId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }
    try {
        // Check if student already has number
        const student = await db.student.findUnique({
            where: { id: studentId },
            select: { nomorUjian: true, namaLengkap: true, telepon: true }
        });

        const updateData: any = {
            statusVerifikasi: "VERIFIED",
            catatanPenolakan: null,
        };

        if (!student?.nomorUjian) {
            // Robust Generation: Generate unique random exam number
            const yearPrefix = new Date().getFullYear().toString().slice(-2);
            let isUnique = false;
            let finalNumber = "";
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed lookalike chars (O, 0, I, 1)

            while (!isUnique) {
                let randomPart = "";
                for (let i = 0; i < 5; i++) {
                    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                finalNumber = `${yearPrefix}${randomPart}`;

                // Check if this number already exists
                const existing = await db.student.findFirst({
                    where: { nomorUjian: finalNumber },
                    select: { id: true }
                });

                if (!existing) {
                    isUnique = true;
                }
            }

            updateData.nomorUjian = finalNumber;

            // Generate Password (6 chars alphanumeric)
            const passChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars
            let pass = "";
            for (let i = 0; i < 6; i++) {
                pass += passChars.charAt(Math.floor(Math.random() * passChars.length));
            }
            updateData.passwordCbt = pass;
        }

        await db.student.update({
            where: { id: studentId },
            data: updateData
        });

        revalidatePath(`/admin/verification/${studentId}`);
        revalidatePath("/admin/verification");
        revalidatePath("/admin/grades");

        await logActivity("VERIFY_STUDENT", "STUDENT", studentId, "Student Verified");

        // Send WA Notification
        if (student?.telepon) {
            const message = `Halo ${student.namaLengkap}, pendaftaran Anda telah TERVERIFIKASI. \nNomor Ujian: ${updateData.nomorUjian || student.nomorUjian}\nPassword CBT: ${updateData.passwordCbt}\nSilakan cetak kartu ujian di dashboard.`;
            await sendWhatsApp(student.telepon, message);
        }

        return { success: true };
    } catch (error) {
        console.error("Error verifying student:", error);
        return { success: false, error: "Gagal memverifikasi murid" };
    }
}

export async function rejectStudent(studentId: string, note: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }
    try {
        await db.student.update({
            where: { id: studentId },
            data: {
                statusVerifikasi: "REJECTED",
                catatanPenolakan: note
            }
        });

        revalidatePath(`/admin/verification/${studentId}`);
        revalidatePath("/admin/verification");

        const student = await db.student.findUnique({
            where: { id: studentId },
            select: { namaLengkap: true, telepon: true }
        });

        await logActivity("REJECT_STUDENT", "STUDENT", studentId, `Reason: ${note}`);

        // Send WA Notification
        if (student?.telepon) {
            const message = `Halo ${student.namaLengkap}, pendaftaran Anda perlu diperbaiki.\nAlasan: ${note}\nSilakan login ke dashboard untuk memperbaiki data/dokumen.`;
            await sendWhatsApp(student.telepon, message);
        }

        return { success: true };
    } catch (error) {
        console.error("Error rejecting student:", error);
        return { success: false, error: "Gagal menolak murid" };
    }
}

export async function verifyDocument(
    studentId: string,
    docKey: string,
    status: "VERIFIED" | "REJECTED" | "PENDING"
) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }
    try {
        const student = await db.student.findUnique({
            where: { id: studentId },
            include: { documents: true }
        });

        if (!student || !student.documents) {
            return { success: false, error: "Dokumen tidak ditemukan" };
        }

        // Map docKey (e.g., fileKK) to status field (e.g., statusKK)
        let statusField = "";

        switch (docKey) {
            case "fileKK": statusField = "statusKK"; break;
            case "fileAkta": statusField = "statusAkta"; break;
            case "fileSKL": statusField = "statusSKL"; break;
            case "fileRaport": statusField = "statusRaport"; break;
            case "filePrestasi": statusField = "statusPrestasi"; break;
            case "pasFoto": statusField = "statusPasFoto"; break;
            default: return { success: false, error: "Tipe dokumen tidak valid" };
        }

        await db.documents.update({
            where: { studentId: studentId },
            data: {
                [statusField]: status
            }
        });

        revalidatePath(`/admin/verification/${studentId}`);

        await logActivity("VERIFY_DOCUMENT", "DOCUMENTS", studentId, `${docKey} -> ${status}`);

        return { success: true };
    } catch (error) {
        console.error("Error verifying document:", error);
        return { success: false, error: "Gagal memverifikasi dokumen" };
    }
}

export async function updateAdmissionStatus(studentId: string, status: "LULUS" | "TIDAK_LULUS" | "PENDING") {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }
    try {
        // Use Prisma Client instead of Raw SQL for better type safety and security
        await db.student.update({
            where: { id: studentId },
            data: { statusKelulusan: status }
        });

        revalidatePath(`/admin/verification/${studentId}`);
        revalidatePath("/admin/ranking");

        await logActivity("UPDATE_ADMISSION", "STUDENT", studentId, `Status: ${status}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating admission status:", error);
        return { success: false, error: "Gagal memperbarui status penerimaan" };
    }
}
