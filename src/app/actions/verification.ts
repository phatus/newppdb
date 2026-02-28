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
            // Robust Generation: Find the highest existing sequence number for the current year
            const yearPrefix = new Date().getFullYear().toString().slice(-2) + "A";

            // Find the student with the highest nomorUjian starting with yearPrefix
            const lastStudent = await db.student.findFirst({
                where: {
                    nomorUjian: {
                        startsWith: yearPrefix
                    }
                },
                orderBy: {
                    nomorUjian: 'desc'
                },
                select: {
                    nomorUjian: true
                }
            });

            let newSequence = 1;
            if (lastStudent?.nomorUjian) {
                // Extract number from 25A0001 -> 0001
                const lastNumStr = lastStudent.nomorUjian.replace(yearPrefix, "");
                const lastNum = parseInt(lastNumStr, 10);
                if (!isNaN(lastNum)) {
                    newSequence = lastNum + 1;
                }
            }

            const sequence = newSequence.toString().padStart(4, "0");
            updateData.nomorUjian = `${yearPrefix}${sequence}`;

            // Generate Password (6 chars alphanumeric)
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars
            let pass = "";
            for (let i = 0; i < 6; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
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
        // Use Raw SQL due to stale Prisma Client
        await db.$executeRawUnsafe(`
            UPDATE "Student" 
            SET "statusKelulusan" = $1
            WHERE "id" = $2
        `, status, studentId);

        revalidatePath(`/admin/verification/${studentId}`);
        revalidatePath("/admin/ranking");

        await logActivity("UPDATE_ADMISSION", "STUDENT", studentId, `Status: ${status}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating admission status:", error);
        return { success: false, error: "Gagal memperbarui status penerimaan" };
    }
}
