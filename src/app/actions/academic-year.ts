"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Get list of all distinct academic years available in the system
 * (from Student records, Waves, and current SchoolSettings)
 */
export async function getAcademicYears() {
    try {
        const settings = await db.schoolSettings.findFirst();
        const currentSettingYear = settings?.academicYear || "2025/2026";

        const studentYears = await db.student.findMany({
            select: { academicYear: true },
            distinct: ["academicYear"],
        });

        const waveYears = await db.wave.findMany({
            select: { academicYear: true },
            distinct: ["academicYear"],
        });

        const yearsSet = new Set<string>();
        yearsSet.add(currentSettingYear);

        studentYears.forEach(s => {
            if (s.academicYear) yearsSet.add(s.academicYear);
        });

        waveYears.forEach(w => {
            if (w.academicYear) yearsSet.add(w.academicYear);
        });

        // Convert set to array sorted descending (e.g., "2026/2027", "2025/2026")
        const yearsArray = Array.from(yearsSet).sort().reverse();

        return {
            success: true,
            currentYear: currentSettingYear,
            years: yearsArray,
        };
    } catch (error) {
        console.error("Error fetching academic years:", error);
        return { success: false, currentYear: "2025/2026", years: ["2025/2026"] };
    }
}

/**
 * Start a new Academic Year (Rollover/Arsip)
 * - Deactivates all previous active waves
 * - Updates SchoolSettings.academicYear to the new academic year
 * - Optionally creates a new Gelombang 1 for the new year
 */
export async function startNewAcademicYear(data: {
    newAcademicYear: string;
    createFirstWave?: boolean;
    waveName?: string;
    quota?: number;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized: Access restricted to ADMIN." };
    }

    const { newAcademicYear, createFirstWave = true, waveName, quota = 100 } = data;

    if (!newAcademicYear || !newAcademicYear.trim()) {
        return { success: false, error: "Tahun Pelajaran baru harus diisi." };
    }

    try {
        // 1. Deactivate all existing waves
        await db.wave.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        // 2. Update or create SchoolSettings
        const settings = await db.schoolSettings.findFirst();
        if (settings) {
            await db.schoolSettings.update({
                where: { id: settings.id },
                data: {
                    academicYear: newAcademicYear.trim(),
                    isRegistrationOpen: true,
                }
            });
        } else {
            await db.schoolSettings.create({
                data: {
                    academicYear: newAcademicYear.trim(),
                    isRegistrationOpen: true,
                }
            });
        }

        // 3. Create initial wave for the new academic year if requested
        if (createFirstWave) {
            const name = waveName?.trim() || `Gelombang 1 (${newAcademicYear.trim()})`;
            const now = new Date();
            const endOfYear = new Date(now.getFullYear(), 11, 31);

            await db.wave.create({
                data: {
                    name,
                    description: `Pendaftaran Gelombang 1 Tahun Pelajaran ${newAcademicYear.trim()}`,
                    startDate: now,
                    endDate: endOfYear,
                    isActive: true,
                    academicYear: newAcademicYear.trim(),
                    quota: quota,
                    jalurAllowed: ["REGULER", "PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK", "AFIRMASI"],
                    pathQuotas: { REGULER: 50, PRESTASI_AKADEMIK: 20, PRESTASI_NON_AKADEMIK: 15, AFIRMASI: 15 }
                }
            });
        }

        // 4. Create Audit Log
        try {
            await db.auditLog.create({
                data: {
                    action: "ROLLOVER_ACADEMIC_YEAR",
                    entity: "SETTINGS",
                    details: `Admin ${session.user.email} rolled over to new academic year ${newAcademicYear}`,
                    userId: session.user.id,
                }
            });
        } catch (e) {
            console.error("Audit log error on rollover:", e);
        }

        revalidatePath("/admin");
        revalidatePath("/admin/settings");
        revalidatePath("/admin/students");
        revalidatePath("/admin/verification");
        revalidatePath("/admin/reports/emis");
        revalidatePath("/admin/ranking");

        return { success: true, message: `Berhasil membuka Tahun Pelajaran ${newAcademicYear}` };
    } catch (error: unknown) {
        console.error("Error starting new academic year:", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal membuat tahun pelajaran baru.";
        return { success: false, error: errorMessage };
    }
}
