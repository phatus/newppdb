
export default function AdminDashboardPage() {
    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-primary">
                            <span className="material-symbols-outlined icon-filled">
                                groups
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                            +12%{" "}
                            <span className="material-symbols-outlined text-[12px]">
                                trending_up
                            </span>
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">
                            Total Pendaftar
                        </p>
                        <h3 className="text-slate-900 dark:text-white text-3xl font-bold">
                            1,240
                        </h3>
                    </div>
                </div>
                {/* Pending Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/10 rounded-bl-full -mr-2 -mt-2"></div>
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                            <span className="material-symbols-outlined icon-filled">
                                pending_actions
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                            Perlu Tindakan
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">
                            Menunggu Verifikasi
                        </p>
                        <h3 className="text-slate-900 dark:text-white text-3xl font-bold">
                            45
                        </h3>
                    </div>
                </div>
                {/* Verified Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600">
                            <span className="material-symbols-outlined icon-filled">
                                verified
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                            +10%{" "}
                            <span className="material-symbols-outlined text-[12px]">
                                trending_up
                            </span>
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">
                            Sudah Terverifikasi
                        </p>
                        <h3 className="text-slate-900 dark:text-white text-3xl font-bold">
                            1,150
                        </h3>
                    </div>
                </div>
                {/* Rejected Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600">
                            <span className="material-symbols-outlined icon-filled">
                                cancel
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            +2%
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Ditolak</p>
                        <h3 className="text-slate-900 dark:text-white text-3xl font-bold">
                            45
                        </h3>
                    </div>
                </div>
            </div>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simple Chart Section Placeholder */}
                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                                Tren Pendaftaran
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Aktivitas pendaftaran 30 hari terakhir
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                        <p className="text-slate-400">Chart Visualization Placeholder</p>
                    </div>
                </div>
                {/* Recent Activity */}
                <div className="flex flex-col bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                            Aktivitas Terbaru
                        </h3>
                        <a href="#" className="text-primary text-sm font-semibold hover:underline">
                            Lihat Semua
                        </a>
                    </div>
                    <div className="flex flex-col gap-0 relative">
                        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100 dark:bg-slate-700"></div>
                        {/* Item 1 */}
                        <div className="flex gap-4 relative pb-6">
                            <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary flex items-center justify-center border-4 border-white dark:border-[#1e293b]">
                                <span className="material-symbols-outlined text-lg">
                                    person_add
                                </span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Budi Santoso mendaftar
                                </p>
                                <p className="text-xs text-slate-500">Baru saja • Jalur Zonasi</p>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="flex gap-4 relative pb-6">
                            <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center border-4 border-white dark:border-[#1e293b]">
                                <span className="material-symbols-outlined text-lg">
                                    check_circle
                                </span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Dokumen Siti Aminah diverifikasi
                                </p>
                                <p className="text-xs text-slate-500">
                                    15 menit lalu • Oleh Admin 2
                                </p>
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="flex gap-4 relative">
                            <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 flex items-center justify-center border-4 border-white dark:border-[#1e293b]">
                                <span className="material-symbols-outlined text-lg">
                                    upload_file
                                </span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Rudi Hartono melengkapi berkas
                                </p>
                                <p className="text-xs text-slate-500">
                                    1 jam lalu • KK & Akta Lahir
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Table Placeholder */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 text-center">
                <p className="text-slate-500">Recent Applicants Table Placeholder (See "Data Pendaftar" page)</p>
            </div>
        </div>
    );
}
