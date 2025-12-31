
export default function VerificationDetailPage() {
    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="mb-2">
                <a href="/admin/students" className="text-slate-500 hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors w-fit">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Kembali ke Data Pendaftar
                </a>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Verifikasi Dokumen
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Validasi kelengkapan dan keabsahan dokumen siswa.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider">
                        Status: Pending
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Data Siswa Card */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                Data Siswa
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Siti Aminah</h2>
                                <p className="text-slate-500 text-sm">ID: REG-2024-045</p>
                            </div>
                            <dl className="grid grid-cols-1 gap-y-4">
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">NISN</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">0087654321</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tempat, Tanggal Lahir</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Bandung, 15 Maret 2012</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Asal Sekolah</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">MI Nurul Huda</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Jalur Pendaftaran</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Prestasi</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alamat</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Jl. Mawar No. 10, RT 01 RW 05, Kec. Melati</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Document Verification List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Dokumen Persyaratan
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Doc Item 1 */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                        <span className="material-symbols-outlined">badge</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-base">Kartu Keluarga (KK)</p>
                                        <p className="text-xs text-slate-500 mb-1">kk_siti_2024.pdf (1.5 MB)</p>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Valid
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                        Lihat
                                    </button>
                                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                        <button title="Valid" className="p-1 rounded text-green-600 bg-white shadow-sm"><span className="material-symbols-outlined text-[20px]">check</span></button>
                                        <button title="Invalid" className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                    </div>
                                </div>
                            </div>

                            {/* Doc Item 2 */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                        <span className="material-symbols-outlined">child_care</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-base">Akta Kelahiran</p>
                                        <p className="text-xs text-slate-500 mb-1">akta_siti.jpg (800 KB)</p>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600">
                                            <span className="material-symbols-outlined text-[14px]">help</span> Belum Diperiksa
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                        Lihat
                                    </button>
                                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                        <button title="Valid" className="p-1 rounded text-slate-400 hover:text-green-600 hover:bg-white hover:shadow-sm"><span className="material-symbols-outlined text-[20px]">check</span></button>
                                        <button title="Invalid" className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-colors">
                                    Tolak dengan Catatan
                                </button>
                                <button className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">verified</span>
                                    Verifikasi Semua
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
