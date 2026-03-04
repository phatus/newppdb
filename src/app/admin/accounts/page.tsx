import { db } from "@/lib/db";
import UserManagement, { User } from "@/components/admin/settings/UserManagement";
import SearchInput from "@/components/admin/SearchInput";
import AccountRoleFilter from "@/components/admin/AccountRoleFilter";
import { Suspense } from "react";

const PAGE_SIZE = 20;

export default async function AccountsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
    const resolvedParams = await searchParams;
    const pageParam = resolvedParams?.page;
    const query = resolvedParams?.q || "";
    const roleFilter = resolvedParams?.role;
    const currentPage = Math.max(1, parseInt(Array.isArray(pageParam) ? pageParam[0] : (pageParam || "1"), 10) || 1);
    const skip = (currentPage - 1) * PAGE_SIZE;

    // Build where clause
    const whereClause: any = {};
    if (query) {
        whereClause.OR = [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
        ];
    }
    if (roleFilter && (roleFilter === "ADMIN" || roleFilter === "USER")) {
        whereClause.role = roleFilter;
    }

    // Fetch users with filters
    const [rawUsers, totalCount, adminCount, userCount] = await Promise.all([
        db.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip,
            take: PAGE_SIZE,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
                emailVerified: true,
                createdAt: true,
            }
        }),
        db.user.count({ where: whereClause }),
        db.user.count({ where: { ...whereClause, role: "ADMIN" } }),
        db.user.count({ where: { ...whereClause, role: "USER" } }),
    ]);

    const users = rawUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified?.toISOString() || null,
    })) as User[];

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Akun</h1>
                    <p className="text-slate-500 dark:text-slate-400">Kelola akun pengguna administrator dan pendaftar.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-end">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <AccountRoleFilter
                        initialRole={roleFilter}
                        totalCount={totalCount}
                        adminCount={adminCount}
                        userCount={userCount}
                    />
                </div>
                <div className="w-full lg:w-auto lg:min-w-[320px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block mb-1.5">Cari Pengguna</span>
                    <Suspense fallback={<div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />}>
                        <SearchInput />
                    </Suspense>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <UserManagement
                    initialUsers={users}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    itemsPerPage={PAGE_SIZE}
                />
            </div>
        </div >
    );
}
