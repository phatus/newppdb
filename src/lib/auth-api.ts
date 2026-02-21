import { encode, decode } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function createApiToken(payload: any) {
    if (!secret) throw new Error("NEXTAUTH_SECRET is not defined");

    return await encode({
        token: payload,
        secret: secret,
        // Set a reasonable maxAge for mobile sessions, e.g., 30 days
        maxAge: 30 * 24 * 60 * 60,
    });
}

export async function verifyApiToken(token: string) {
    if (!secret) throw new Error("NEXTAUTH_SECRET is not defined");

    try {
        const decoded = await decode({
            token,
            secret,
        });
        return decoded;
    } catch (error) {
        return null;
    }
}
