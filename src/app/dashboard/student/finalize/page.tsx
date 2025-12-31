
export default function FinalizePage() {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-5xl mx-auto space-y-6 w-full">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <a
                                href="/dashboard"
                                className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined text-[20px] mr-2">
                                    home
                                </span>
                                Beranda
                            </a>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-slate-400 mx-1">
                                    chevron_right
                                </span>
                                <a
                                    href="#"
                                    className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                                >
                                    Pendaftaran
                                </a>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-slate-400 mx-1">
                                    chevron_right
                                </span>
                                <span className="text-sm font-medium text-primary dark:text-primary">
                                    Finalisasi & Cetak
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Finalisasi & Cetak Bukti
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Langkah terakhir: Periksa data Anda dan konfirmasi pendaftaran.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full text-sm font-bold border border-blue-100 dark:border-blue-800">
                        <span className="material-symbols-outlined text-[18px]">pending</span>
                        Status: Belum Finalisasi
                    </div>
                </div>
                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Data Review */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Alert Warning */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-500">
                                    warning
                                </span>
                                <div>
                                    <h3 className="font-bold text-amber-800 dark:text-amber-400">
                                        Peringatan Penting
                                    </h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                        Pastikan seluruh data yang Anda masukkan sudah benar. Data{" "}
                                        <span className="font-bold">tidak dapat diubah kembali</span>{" "}
                                        setelah Anda menekan tombol Finalisasi Data.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Data Diri Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">
                                        person
                                    </span>
                                    Data Diri Siswa
                                </h3>
                                <button className="text-primary text-sm font-semibold hover:underline">
                                    Ubah Data
                                </button>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Nama Lengkap
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            Budi Santoso
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            NISN
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            0012345678
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Tempat, Tanggal Lahir
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            Jakarta, 12 Januari 2012
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Jenis Kelamin
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            Laki-laki
                                        </dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Alamat Domisili
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            Jl. Merpati No. 45, RT 02 RW 03, Kel. Kebon Jeruk, Kec.
                                            Kebon Jeruk, Jakarta Barat
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        {/* Data Akademik Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">
                                        school
                                    </span>
                                    Data Akademik
                                </h3>
                                <button className="text-primary text-sm font-semibold hover:underline">
                                    Ubah Data
                                </button>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Asal Sekolah
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            SD Negeri 1 Kota
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            NPSN Sekolah Asal
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            20100345
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Nilai Rata-rata Rapor
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            88.50
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Jalur Pendaftaran
                                        </dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            Zonasi
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                    {/* Right Column: Documents & Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Document Checklist */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">
                                        description
                                    </span>
                                    Berkas Diunggah
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {/* File Item */}
                                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[20px]">
                                                check_circle
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Kartu Keluarga
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                kk_budi_2024.pdf
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                                {/* File Item */}
                                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[20px]">
                                                check_circle
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Akte Kelahiran
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                akte_budi.jpg
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                                {/* File Item */}
                                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[20px]">
                                                check_circle
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Rapor Nilai
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                rapor_sms_1-5.pdf
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Final Action Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-primary/20 p-6 flex flex-col gap-6 sticky top-24">
                            <div className="flex flex-col gap-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        Saya menyatakan bahwa seluruh data dan dokumen yang saya unggah
                                        adalah benar dan dapat dipertanggungjawabkan sesuai hukum yang
                                        berlaku.
                                    </span>
                                </label>
                                {/* Primary Button */}
                                <a
                                    href="/dashboard/student/exam-card"
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-decoration-none"
                                >
                                    <span className="material-symbols-outlined">lock</span>
                                    Finalisasi Data
                                </a>
                            </div>
                            <div className="text-center">
                                <a
                                    href="#"
                                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline decoration-dotted"
                                >
                                    Butuh bantuan? Hubungi Admin
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
