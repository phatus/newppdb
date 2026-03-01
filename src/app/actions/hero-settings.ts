"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/file-utils";
import { uploadBufferToS3 } from "@/lib/s3-client";

export async function updateHeroImage(formData: FormData) {
    try {
        const file = formData.get("heroImage") as File;

        if (!file) {
            return { success: false, error: "Tidak ada file yang dipilih" };
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." };
        }

        // Validate file size (max 5MB for hero)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "Ukuran file terlalu besar. Maksimal 5MB." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to S3 instead of local FS
        const imageUrl = await uploadBufferToS3(buffer, file.name, file.type);

        // Update database (Raw SQL for safety against stale client)
        const first = await db.schoolSettings.findFirst();

        if (first) {
            // Delete old hero image if it exists
            if (first.heroImage && first.heroImage !== imageUrl) {
                await deleteFile(first.heroImage);
            }

            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "heroImage" = $1
                WHERE "id" = $2
            `, imageUrl, first.id);
        } else {
            const created = await db.schoolSettings.create({
                data: { schoolName: "Nama Sekolah" } // minimal
            });
            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "heroImage" = $1
                WHERE "id" = $2
            `, imageUrl, created.id);
        }

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout");

        return { success: true, url: imageUrl };

    } catch (error) {
        console.error("Error updating hero image:", error);
        return { success: false, error: "Gagal mengupload gambar hero" };
    }
}
