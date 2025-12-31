
export default function StudentListPage() {
    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Data Calon Siswa
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Kelola data seluruh pendaftar PPDB.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Cari nama, NISN, atau asal sekolah..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
                <div className="flex gap-4 text-sm font-medium text-slate-500">
                    <span>Total: <strong className="text-slate-900 dark:text-white">1,240</strong></span>
                    <span>Verifikasi: <strong className="text-yellow-600">45</strong></span>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">No</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">NISN</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Asal Sekolah</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Jalur</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Row 1 */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-slate-500">1</td>
                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Ahmad Fauzi</td>
                                <td className="px-6 py-4 text-slate-500 font-mono">0012345678</td>
                                <td className="px-6 py-4 text-slate-500">SD Negeri 1 Jakarta</td>
                                <td className="px-6 py-4 text-slate-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Zonasi
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Verified
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Detail">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                        <button className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Row 2 */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-slate-500">2</td>
                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Siti Aminah</td>
                                <td className="px-6 py-4 text-slate-500 font-mono">0087654321</td>
                                <td className="px-6 py-4 text-slate-500">MI Nurul Huda</td>
                                <td className="px-6 py-4 text-slate-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Prestasi
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span> Pending
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href="/admin/verification/123" className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Verifikasi">
                                            <span className="material-symbols-outlined text-[20px]">edit_document</span>
                                        </a>
                                        <button className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="bg-white dark:bg-[#1e293b] px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Menampilkan <span className="font-medium text-slate-900 dark:text-white">1</span> sampai <span className="font-medium text-slate-900 dark:text-white">10</span> dari <span className="font-medium text-slate-900 dark:text-white">1,240</span> data
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Previous</button>
                        <button className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
