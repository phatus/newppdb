import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { deleteFile } from "@/lib/file-utils";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("juknis") as File;

        if (!file) {
            return NextResponse.json({ message: "Tidak ada file yang dipilih" }, { status: 400 });
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json({ message: "Format file tidak didukung. Hanya PDF yang diperbolehkan." }, { status: 400 });
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ message: "Ukuran file terlalu besar. Maksimal 10MB." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `juknis_${Date.now()}.pdf`;

        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${filename}`;

        // Update database
        const first = await db.schoolSettings.findFirst();

        if (first) {
            // Delete old file
            if (first.juknisFile) {
                await deleteFile(first.juknisFile);
            }

            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "juknisFile" = $1
                WHERE "id" = $2
            `, fileUrl, first.id);
        } else {
            const created = await db.schoolSettings.create({
                data: { schoolName: "Nama Sekolah" }
            });
            await db.$executeRawUnsafe(`
                UPDATE "SchoolSettings" 
                SET "juknisFile" = $1
                WHERE "id" = $2
            `, fileUrl, created.id);
        }

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout");

        await logActivity("UPLOAD_JUKNIS", "SETTINGS", first?.id || "create", `Uploaded juknis via API: ${file.name}`);

        return NextResponse.json({
            success: true,
            url: fileUrl
        }, { status: 200 });

    } catch (error) {
        console.error("Juknis upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
