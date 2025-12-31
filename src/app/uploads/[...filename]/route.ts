import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ filename: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const filename = resolvedParams.filename.join("/");

        // Prevent directory traversal
        if (filename.includes("..")) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const filePath = path.join(process.cwd(), "public/uploads", filename);

        if (!existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        // Determine content type (basic)
        const ext = path.extname(filename).toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".pdf") contentType = "application/pdf";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
