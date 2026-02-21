import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function handler(req: Request, session: any) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({
            message: "File uploaded successfully",
            url: fileUrl,
            filename: file.name
        }, { status: 201 });

    } catch (error) {
        console.error("API Upload Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return withAuth(req, handler);
}
