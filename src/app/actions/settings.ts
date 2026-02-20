"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function getSettings() {
    try {
        const settings = await db.schoolSettings.findFirst();
        return settings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
}

export async function updateSettings(data: {
    schoolName?: string;
    schoolAddress?: string;
    academicYear?: string;
    isRegistrationOpen?: boolean;
    showQuota?: boolean;
    committeeName?: string;
    committeeNip?: string;
    principalName?: string;
    principalNip?: string;
    schoolCity?: string;
    studentQuota?: number;
    quotaReguler?: number;
    quotaPrestasiAkademik?: number;
    quotaPrestasiNonAkademik?: number;
    quotaAfirmasi?: number;
    waGatewayToken?: string;
    waGatewayUrl?: string;
    isWaEnabled?: boolean;
    heroTitle?: string;
    heroDescription?: string;
    pathWeights?: any;
}) {
    try {
        const {
            schoolName, schoolAddress, academicYear, isRegistrationOpen, showQuota,
            committeeName, committeeNip, principalName, principalNip, schoolCity,
            studentQuota, quotaReguler, quotaPrestasiAkademik, quotaPrestasiNonAkademik, quotaAfirmasi,
            waGatewayToken, waGatewayUrl, isWaEnabled,
            heroTitle, heroDescription, pathWeights
        } = data;

        // Use raw query to update to avoid stale Prisma Client issues for new columns
        const first = await db.schoolSettings.findFirst();

        if (first) {
            const updateData: any = {
                schoolName: data.schoolName,
                schoolAddress: data.schoolAddress,
                academicYear: data.academicYear,
                isRegistrationOpen: data.isRegistrationOpen,
            };

            await db.schoolSettings.update({
                where: { id: first.id },
                data: updateData,
            });

            // Update new fields via Raw SQL to avoid Prisma Client mismatch
            const updates = [];
            const values = [];
            let i = 1;

            if (studentQuota !== undefined) {
                updates.push(`"studentQuota" = $${i++}`);
                values.push(studentQuota);
            }
            if (quotaReguler !== undefined) {
                updates.push(`"quotaReguler" = $${i++}`);
                values.push(quotaReguler);
            }
            if (quotaPrestasiAkademik !== undefined) {
                updates.push(`"quotaPrestasiAkademik" = $${i++}`);
                values.push(quotaPrestasiAkademik);
            }
            if (quotaPrestasiNonAkademik !== undefined) {
                updates.push(`"quotaPrestasiNonAkademik" = $${i++}`);
                values.push(quotaPrestasiNonAkademik);
            }
            if (quotaAfirmasi !== undefined) {
                updates.push(`"quotaAfirmasi" = $${i++}`);
                values.push(quotaAfirmasi);
            }

            if (data.committeeName !== undefined) {
                updates.push(`"committeeName" = $${i++}`);
                values.push(data.committeeName);
            }
            if (data.committeeNip !== undefined) {
                updates.push(`"committeeNip" = $${i++}`);
                values.push(data.committeeNip);
            }
            if (data.principalName !== undefined) {
                updates.push(`"principalName" = $${i++}`);
                values.push(data.principalName);
            }
            if (data.principalNip !== undefined) {
                updates.push(`"principalNip" = $${i++}`);
                values.push(data.principalNip);
            }
            if (data.schoolCity !== undefined) {
                updates.push(`"schoolCity" = $${i++}`);
                values.push(data.schoolCity);
            }
            if (data.waGatewayToken !== undefined) {
                updates.push(`"waGatewayToken" = $${i++}`);
                values.push(data.waGatewayToken);
            }
            if (data.waGatewayUrl !== undefined) {
                updates.push(`"waGatewayUrl" = $${i++}`);
                values.push(data.waGatewayUrl);
            }
            if (data.isWaEnabled !== undefined) {
                updates.push(`"isWaEnabled" = $${i++}`);
                values.push(data.isWaEnabled);
            }
            if (data.heroTitle !== undefined) {
                updates.push(`"heroTitle" = $${i++}`);
                values.push(data.heroTitle);
            }
            if (data.heroDescription !== undefined) {
                updates.push(`"heroDescription" = $${i++}`);
                values.push(data.heroDescription);
            }
            if (data.pathWeights !== undefined) {
                updates.push(`"pathWeights" = $${i++}::jsonb`);
                values.push(JSON.stringify(data.pathWeights));
            }

            if (data.showQuota !== undefined) {
                updates.push(`"showQuota" = $${i++}`);
                values.push(data.showQuota);
            }

            if (updates.length > 0) {
                values.push(first.id);
                await db.$executeRawUnsafe(`
                    UPDATE "SchoolSettings" 
                    SET ${updates.join(", ")}
                    WHERE "id" = $${i}
                `, ...values);
            }
        } else {
            await db.schoolSettings.create({
                data: {
                    schoolName: data.schoolName || "Nama Sekolah",
                    schoolAddress: data.schoolAddress,
                    academicYear: data.academicYear || "2025/2026",
                    isRegistrationOpen: data.isRegistrationOpen ?? true,
                    showQuota: data.showQuota ?? true,
                },
            });

            // If we just created it, get it again to update new fields via Raw SQL
            const newlyCreated = await db.schoolSettings.findFirst();
            if (newlyCreated && data.committeeName) {
                await db.$executeRawUnsafe(`
                    UPDATE "SchoolSettings" 
                    SET "committeeName" = $1
                    WHERE "id" = $2
                `, data.committeeName, newlyCreated.id);
            }
        }

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout"); // Update public pages too

        await logActivity("UPDATE_SETTINGS", "SETTINGS", first?.id || "create", JSON.stringify(data));

        return { success: true };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { success: false, error: "Gagal menyimpan pengaturan" };
    }
}

import { deleteFile } from "@/lib/file-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateLogo(formData: FormData) {
    try {
        const file = formData.get("logo") as File;

        if (!file) {
            return { success: false, error: "Tidak ada file yang dipilih" };
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." };
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return { success: false, error: "Ukuran file terlalu besar. Maksimal 2MB." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename and add timestamp to avoid cache issues
        const ext = path.extname(file.name);
        const filename = `school_logo_${Date.now()}${ext}`;

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const logoUrl = `/uploads/${filename}`;

        // Update database and delete old file
        const first = await db.schoolSettings.findFirst();
        if (first) {
            // Delete old logo if it exists
            if (first.schoolLogo && first.schoolLogo !== logoUrl) {
                await deleteFile(first.schoolLogo);
            }

            await db.schoolSettings.update({
                where: { id: first.id },
                data: { schoolLogo: logoUrl },
            });
        } else {
            await db.schoolSettings.create({
                data: {
                    schoolLogo: logoUrl,
                },
            });
        }

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout");

        return { success: true, url: logoUrl };

    } catch (error) {
        console.error("Error updating logo:", error);
        return { success: false, error: "Gagal mengupload logo" };
    }
}

// Update PPDB Schedule
export async function updateSchedule(schedule: any[]) {
    try {
        const first = await db.schoolSettings.findFirst();

        if (first) {
            await db.schoolSettings.update({
                where: { id: first.id },
                data: { ppdbSchedule: schedule },
            });
        } else {
            await db.schoolSettings.create({
                data: {
                    ppdbSchedule: schedule,
                },
            });
        }

        revalidatePath("/admin/settings");
        revalidatePath("/"); // Revalidate home page where schedule might be shown

        return { success: true };
    } catch (error) {
        console.error("Error updating schedule:", error);
        return { success: false, error: "Gagal menyimpan jadwal" };
    }
}

export async function updateRankingWeights(data: {
    weightRapor: number;
    weightUjian: number;
    weightSKUA: number;
}) {
    try {
        let first = await db.schoolSettings.findFirst();

        if (!first) {
            // Create minimal record if doesn't exist, using only legacy fields safe for stale client
            try {
                first = await db.schoolSettings.create({
                    data: {
                        schoolName: "Nama Sekolah",
                        academicYear: "2025/2026",
                    }
                });
            } catch (createError) {
                // If create fails (maybe due to other constraints), try to find again or throw
                console.error("Failed to create settings:", createError);
                first = await db.schoolSettings.findFirst();
            }
        }

        if (first) {
            // Use RAW QUERY to bypass stale Prisma Client (EPERM error preventing regeneration)
            // We assume table name is "SchoolSettings" and columns are camelCase as per schema default
            const query = `
                UPDATE "SchoolSettings" 
                SET "weightRapor" = ${data.weightRapor}, 
                    "weightUjian" = ${data.weightUjian}, 
                    "weightSKUA" = ${data.weightSKUA} 
                WHERE "id" = '${first.id}'
            `;

            // We use executeRawUnsafe because parameterized executeRaw needs distinct template parts
            await db.$executeRawUnsafe(query);

            // Also try standard update for standard fields if needed, but not here.
        }

        revalidatePath("/admin/settings");

        await logActivity("UPDATE_RANKING_WEIGHTS", "SETTINGS", first?.id || "unknown", JSON.stringify(data));

        return { success: true };
    } catch (error) {
        console.error("Error updating ranking weights (Raw):", error);
        console.error("Data:", data);
        return { success: false, error: "Gagal menyimpan bobot. Client/DB mismatch." };
    }
}

export async function updateSignature(formData: FormData) {
    try {
        const file = formData.get("signature") as File;
        if (!file) return { success: false, error: "Tidak ada file" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name);
        const filename = `signature_${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), "public/uploads");
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        const sigUrl = `/uploads/${filename}`;

        const first = await db.schoolSettings.findFirst();
        if (first) {
            // Delete old signature if it exists
            if (first.committeeSignature && first.committeeSignature !== sigUrl) {
                await deleteFile(first.committeeSignature);
            }

            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "committeeSignature" = $1
                WHERE "id" = $2
            `, sigUrl, first.id);
        } else {
            const created = await db.schoolSettings.create({
                data: { schoolName: "Nama Sekolah" }
            });
            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "committeeSignature" = $1
                WHERE "id" = $2
            `, sigUrl, created.id);
        }

        revalidatePath("/admin/settings");
        return { success: true, url: sigUrl };
    } catch (error) {
        console.error("Error updating signature:", error);
        return { success: false, error: "Gagal upload Tanda Tangan" };
    }
}


// Delete Juknis PDF
export async function deleteJuknis() {
    try {
        const first = await db.schoolSettings.findFirst();

        if (first && first.juknisFile) {
            await deleteFile(first.juknisFile);

            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "juknisFile" = NULL
                WHERE "id" = $1
            `, first.id);

            revalidatePath("/admin/settings");
            revalidatePath("/", "layout");

            await logActivity("DELETE_JUKNIS", "SETTINGS", first.id, "Deleted juknis file");

            return { success: true };
        }

        return { success: false, error: "Tidak ada file juknis untuk dihapus" };
    } catch (error) {
        console.error("Error deleting juknis:", error);
        return { success: false, error: "Gagal menghapus file juknis" };
    }
}

