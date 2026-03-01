import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { uploadBufferToS3 } from "@/lib/s3-client";

async function handler(req: Request, session: any) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to S3 instead of local FS
        const fileUrl = await uploadBufferToS3(buffer, file.name, file.type);

        return NextResponse.json({
            message: "File uploaded successfully to Cloud Storage",
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
