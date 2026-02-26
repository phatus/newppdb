import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcryptjs";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/auth/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user) {
                    throw new Error("Email tidak terdaftar.");
                }

                if (!user.password) {
                    throw new Error("Akun ini tidak memiliki password. Silakan masuk menggunakan Google.");
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Password salah.");
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error("Email belum diverifikasi. Silakan cek inbox Anda.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = (user as any).role || "USER";
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as any;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    events: {
        async signIn({ user, account }) {
            try {
                if (user?.id) {
                    const provider = account?.provider || "credentials";
                    const id = crypto.randomUUID();
                    const now = new Date();
                    await db.$executeRawUnsafe(`
                        INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "details", "userId", "createdAt")
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, id, "LOGIN", "USER", user.id, `User logged in via ${provider}: ${user.email}`, user.id, now);
                }
            } catch (e) {
                console.error("SignIn event log error:", e);
            }
        },
        async createUser({ user }) {
            try {
                if (user?.id) {
                    const id = crypto.randomUUID();
                    const now = new Date();
                    await db.$executeRawUnsafe(`
                        INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "details", "userId", "createdAt")
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, id, "REGISTER_USER", "USER", user.id, `User registered via Google: ${user.email}`, user.id, now);
                }
            } catch (e) {
                console.error("CreateUser event log error:", e);
            }
        }
    }
};

