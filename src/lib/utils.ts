
/**
 * Normalizes a file URL by ensuring it has a leading slash if it's a relative path.
 * If the URL is already absolute (starts with http) or null, it returns it as is.
 * This function is browser-safe.
 */
export function getFileUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
}
