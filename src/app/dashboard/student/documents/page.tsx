
export default function DocumentUploadPage() {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-[960px] mx-auto space-y-6 w-full">
                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Unggah Dokumen Siswa
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                        Silakan unggah dokumen digital untuk kelengkapan administrasi calon
                        siswa baru.
                    </p>
                </div>
                {/* Student Profile Card */}
                <div className="flex flex-col md:flex-row p-6 bg-white dark:bg-[#1A2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 gap-6 items-start md:items-center">
                    <div className="bg-slate-200 rounded-lg w-24 h-24 shrink-0 shadow-inner flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                                <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                                    Budi Santoso
                                </p>
                                <p className="text-primary font-medium text-sm mt-1">
                                    ID Pendaftaran: REG-2024-001
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                                Dokumen Belum Lengkap
                            </span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <p>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Asal Sekolah:
                                </span>{" "}
                                SD Negeri 1 Jakarta
                            </p>
                            <p>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Jalur:
                                </span>{" "}
                                Zonasi
                            </p>
                        </div>
                    </div>
                </div>
                {/* Document List Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Daftar Dokumen
                    </h3>
                    {/* Item 1: Akta Kelahiran (Pending) */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1A2632] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 items-start md:items-center justify-between group hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <div className="flex flex-col justify-center gap-1">
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                                    Akta Kelahiran
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-medium">
                                        Wajib
                                    </span>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Format PDF/JPG, Max 2MB.
                                    </p>
                                </div>
                                <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-slate-300"></span>
                                    Status: Belum Diunggah
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                            <button className="flex w-full md:w-auto cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium leading-normal transition-colors border border-transparent">
                                <span className="material-symbols-outlined text-[20px]">
                                    upload_file
                                </span>
                                <span>Unggah</span>
                            </button>
                        </div>
                    </div>
                    {/* Item 2: Kartu Keluarga (Completed) */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1A2632] p-4 rounded-xl shadow-sm border border-green-200 dark:border-green-900/30 items-start md:items-center justify-between">
                        <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className="text-green-600 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 shrink-0 size-12">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <div className="flex flex-col justify-center gap-1">
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                                    Kartu Keluarga (KK)
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-medium">
                                        Wajib
                                    </span>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Scan asli kartu keluarga terbaru.
                                    </p>
                                </div>
                                <p className="text-green-600 dark:text-green-400 text-sm font-medium mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">
                                        check_circle
                                    </span>
                                    Status: Berhasil Diunggah
                                </p>
                                <p className="text-xs text-slate-400">
                                    File: KK_Budi_2024.pdf (1.2 MB)
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto shrink-0 flex gap-2 mt-2 md:mt-0">
                            <button
                                className="flex flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                                title="Lihat"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    visibility
                                </span>
                            </button>
                            <button
                                className="flex flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30 transition-colors"
                                title="Hapus"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    delete
                                </span>
                            </button>
                        </div>
                    </div>
                    {/* Item 3: Surat Keterangan Lulus (SKL) */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1A2632] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 items-start md:items-center justify-between group hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <div className="flex flex-col justify-center gap-1">
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                                    Surat Keterangan Lulus (SKL)
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-medium">
                                        Wajib
                                    </span>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Dari sekolah asal.
                                    </p>
                                </div>
                                <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-slate-300"></span>
                                    Status: Belum Diunggah
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                            <button className="flex w-full md:w-auto cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium leading-normal transition-colors border border-transparent">
                                <span className="material-symbols-outlined text-[20px]">
                                    upload_file
                                </span>
                                <span>Unggah</span>
                            </button>
                        </div>
                    </div>
                    {/* Item 4: Raport */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1A2632] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 items-start md:items-center justify-between group hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                                <span className="material-symbols-outlined">analytics</span>
                            </div>
                            <div className="flex flex-col justify-center gap-1">
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                                    Nilai Raport Kelas 5
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-medium">
                                        Wajib
                                    </span>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Semester 1 & 2 digabung dalam 1 file PDF.
                                    </p>
                                </div>
                                <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-slate-300"></span>
                                    Status: Belum Diunggah
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                            <button className="flex w-full md:w-auto cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium leading-normal transition-colors border border-transparent">
                                <span className="material-symbols-outlined text-[20px]">
                                    upload_file
                                </span>
                                <span>Unggah</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Footer Action Buttons */}
                <div className="sticky bottom-0 bg-background-light/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse md:flex-row justify-between gap-4 z-10">
                    <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold leading-normal border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm w-full md:w-auto">
                        Kembali
                    </button>
                    <a
                        href="/dashboard/student/finalize"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal transition-colors shadow-md shadow-blue-500/20 w-full md:w-auto text-decoration-none"
                    >
                        <span>Simpan & Lanjutkan</span>
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
