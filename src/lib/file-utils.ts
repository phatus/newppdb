import { unlink } from "fs/promises";
import path from "path";
import { deleteFromS3 } from "./s3-client";

/**
 * Safely deletes a file from the public/uploads directory or Cloudflare R2 bucket.
 * @param fileUrl The relative URL of the file (e.g., "/uploads/filename.png") or R2 public URL
 */
export async function deleteFile(fileUrl: string | null | undefined) {
    if (!fileUrl || typeof fileUrl !== 'string') return;

    // Check if it's a remote URL (S3/R2)
    if (fileUrl.startsWith('http')) {
        return await deleteFromS3(fileUrl);
    }

    // Only allow deletion of files within the /uploads/ directory for security
    if (!fileUrl.startsWith("/uploads/")) {
        console.log(`[File Delete] Skipping non-upload path: ${fileUrl}`);
        return;
    }

    try {
        // Construct absolute path from current working directory
        const absolutePath = path.join(process.cwd(), "public", fileUrl);

        await unlink(absolutePath);
        console.log(`[File Delete] Successfully deleted: ${absolutePath}`);
        return true;
    } catch (err: any) {
        // Ignore error if file doesn't exist (ENOENT)
        if (err.code === 'ENOENT') {
            console.warn(`[File Delete] File not found (already deleted?): ${fileUrl}`);
        } else {
            console.error(`[File Delete] Failed to delete ${fileUrl}:`, err);
        }
        return false;
    }
}

/**
 * Deletes multiple files at once.
 * @param fileUrls Array of relative URLs
 */
export async function deleteFiles(fileUrls: (string | null | undefined)[]) {
    if (!fileUrls || !Array.isArray(fileUrls)) return;

    const results = await Promise.all(
        fileUrls.map(url => deleteFile(url))
    );

    return results;
}
