import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "";
const publicUrl = process.env.R2_PUBLIC_URL || "";

export const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export async function uploadBufferToS3(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const key = `uploads/${Date.now()}-${filename.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    });

    try {
        await s3Client.send(command);
        // Return the public URL
        const finalUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
        return `${finalUrl}/${key}`;
    } catch (error) {
        console.error("Error uploading to R2:", error);
        throw new Error("Failed to upload file to Cloud Storage");
    }
}

export async function deleteFromS3(fileUrl: string): Promise<boolean> {
    try {
        // Extract the Key from the public URL. 
        // We know our files are in 'uploads/' folder.
        // We want to handle both original .r2.dev URLs and custom domains.
        let key = "";

        if (fileUrl.includes("/uploads/")) {
            key = fileUrl.substring(fileUrl.indexOf("uploads/"));
        } else {
            // Fallback: take everything after the first single slash after the domain
            const urlObj = new URL(fileUrl);
            key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
        }

        if (!key) {
            console.warn("Could not extract key from URL for deletion:", fileUrl);
            return false;
        }

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`[R2 Delete] Successfully deleted key: ${key}`);
        return true;
    } catch (error) {
        console.error("Error deleting from R2:", error);
        return false;
    }
}
