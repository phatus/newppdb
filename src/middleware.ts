import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
        const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
        const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            return null;
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }
            return NextResponse.redirect(
                new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        if (isAdminPage && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // If accessing dashboard but is admin, maybe redirect to admin dashboard?
        // Depends on requirements. User might have both roles or Admin is separate.
        // For now, allow Admin to access dashboard too or keep separate. 
        // The requirement implies Admin has their own dashboard.

        return null;
    },
    {
        callbacks: {
            authorized: async ({ token }) => {
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
