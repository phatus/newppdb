import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadBufferToS3 } from "@/lib/s3-client";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

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
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
