import Link from "next/link";

export default function ReportsHubPage() {
    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Pusat Laporan & Cetak
                </h1>
                <p className="text-slate-500 text-sm">
                    Unduh rekapitulasi data, berita acara, dan dokumen administrasi lainnya.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Rekapitulasi Data */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined text-2xl">table_view</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Rekapitulasi Pendaftar</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Daftar seluruh calon murid dengan detail biodata, nilai, dan status verifikasi. Tersedia format Excel & PDF.
                        </p>
                        <Link href="/admin/reports/recap" className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                            Buka Rekapitulasi &rarr;
                        </Link>
                    </div>
                </div>

                {/* 2. Berita Acara Ranking */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Berita Acara Seleksi</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Dokumen resmi hasil pemeringkatan (ranking) murid yang lolos seleksi. Siap cetak dengan kop sekolah.
                        </p>
                        <Link href="/admin/reports/ranking" className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                            Buat Berita Acara &rarr;
                        </Link>
                    </div>
                </div>

                {/* 3. Cetak Kartu Massal */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined text-2xl">badge</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Cetak Kartu Massal</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Cetak kartu ujian untuk seluruh murid terverifikasi sekaligus. Hemat waktu distribusi kartu.
                        </p>
                        <Link href="/admin/reports/mass-print" className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                            Cetak Kartu Massal &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
