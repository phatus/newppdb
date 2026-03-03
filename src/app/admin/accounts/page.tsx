import { db } from "@/lib/db";
import UserManagement, { User } from "@/components/admin/settings/UserManagement";

const PAGE_SIZE = 20;

export default async function AccountsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const resolvedParams = await searchParams;
    const pageParam = resolvedParams?.page;
    const currentPage = Math.max(1, parseInt(Array.isArray(pageParam) ? pageParam[0] : (pageParam || "1"), 10) || 1);
    const skip = (currentPage - 1) * PAGE_SIZE;

    // Fetch users for the management component
    const rawUsers = await db.user.findMany({
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
    });

    const users = rawUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified?.toISOString() || null,
    })) as User[];

    const totalCount = await db.user.count();
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Akun</h1>
                    <p className="text-slate-500 dark:text-slate-400">Kelola akun pengguna administrator dan pendaftar.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                {/* Reusing existing component with new pagination props */}
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
