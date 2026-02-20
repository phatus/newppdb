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
                // Redirect based on role instead of just /dashboard
                if (token?.role === "ADMIN") {
                    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
                }
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

        // If admin is on /dashboard, redirect to /admin/dashboard
        if (isDashboardPage && token?.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }

        return null;
    },
    {
        callbacks: {
            authorized: async ({ token }) => {
                return true; // Handle logic inside middleware function
            },
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};

