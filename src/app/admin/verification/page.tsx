
export default function VerificationListPage() {
    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Verifikasi Dokumen
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Daftar siswa yang menunggu validasi dokumen.
                    </p>
                </div>
            </div>

            {/* Stats/Filter Bar */}
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-bold flex items-center gap-2">
                        Pending <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-xs">45</span>
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        Ditolak <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs ml-1">12</span>
                    </button>
                </div>
                <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Cari siswa..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card Item 1 */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Siti Aminah</h3>
                                <p className="text-xs text-slate-500">ID: REG-2024-045</p>
                            </div>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div className="flex justify-between">
                            <span>Jalur:</span>
                            <span className="font-medium text-slate-900 dark:text-white">Prestasi</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Dokumen:</span>
                            <span className="font-medium text-slate-900 dark:text-white">Lengkap (4/4)</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tgl Daftar:</span>
                            <span className="font-medium text-slate-900 dark:text-white">15 Mei 2024</span>
                        </div>
                    </div>
                    <a href="/admin/verification/123" className="mt-2 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-lg font-bold text-sm transition-all">
                        <span className="material-symbols-outlined text-[18px]">edit_document</span>
                        Verifikasi Sekarang
                    </a>
                </div>

                {/* Card Item 2 */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Rudi Hartono</h3>
                                <p className="text-xs text-slate-500">ID: REG-2024-048</p>
                            </div>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div className="flex justify-between">
                            <span>Jalur:</span>
                            <span className="font-medium text-slate-900 dark:text-white">Zonasi</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Dokumen:</span>
                            <span className="font-medium text-slate-900 dark:text-white">Kurang (3/4)</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tgl Daftar:</span>
                            <span className="font-medium text-slate-900 dark:text-white">16 Mei 2024</span>
                        </div>
                    </div>
                    <a href="/admin/verification/124" className="mt-2 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-lg font-bold text-sm transition-all">
                        <span className="material-symbols-outlined text-[18px]">edit_document</span>
                        Verifikasi Sekarang
                    </a>
                </div>
            </div>
        </div>
    );
}
