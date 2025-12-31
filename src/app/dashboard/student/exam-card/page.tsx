
export default function ExamCardPage() {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-[1100px] mx-auto space-y-6 w-full">
                {/* Back Link */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <a
                        href="/dashboard"
                        className="hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Kembali ke Dashboard
                    </a>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Status Sidebar (Timeline) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">
                                Status Pendaftaran
                            </h3>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 flex gap-3 mb-6">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                                    verified
                                </span>
                                <div>
                                    <p className="font-bold text-green-700 dark:text-green-400 text-sm">
                                        Terverifikasi
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-1 leading-relaxed">
                                        Berkas Anda telah diverifikasi oleh panitia. Silakan unduh kartu
                                        ujian.
                                    </p>
                                </div>
                            </div>
                            {/* Timeline */}
                            <div className="relative pl-2">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="relative flex items-center gap-4 mb-6">
                                    <div className="size-4 rounded-full bg-primary ring-4 ring-white dark:ring-slate-800 z-10"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Pendaftaran Akun
                                        </p>
                                        <p className="text-[10px] text-slate-500">10 Mei 2024</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center gap-4 mb-6">
                                    <div className="size-4 rounded-full bg-primary ring-4 ring-white dark:ring-slate-800 z-10"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Lengkapi Biodata
                                        </p>
                                        <p className="text-[10px] text-slate-500">12 Mei 2024</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center gap-4 mb-6">
                                    <div className="size-4 rounded-full bg-primary ring-4 ring-white dark:ring-slate-800 z-10"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Verifikasi Berkas
                                        </p>
                                        <p className="text-[10px] text-slate-500">15 Mei 2024</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center gap-4 mb-6">
                                    <div className="size-4 rounded-full bg-orange-500 ring-4 ring-white dark:ring-slate-800 z-10 animate-pulse"></div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                            Cetak Kartu Ujian
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            Sedang Berlangsung
                                        </p>
                                    </div>
                                </div>
                                <div className="relative flex items-center gap-4">
                                    <div className="size-4 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-800 z-10"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                            Pelaksanaan Ujian
                                        </p>
                                        <p className="text-[10px] text-slate-500">20 Jun 2024</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Help Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <p className="font-bold text-slate-800 dark:text-blue-100 text-sm mb-2">
                                Butuh Bantuan?
                            </p>
                            <p className="text-xs text-slate-600 dark:text-blue-200 mb-3 leading-relaxed">
                                Jika terdapat kesalahan data pada kartu ujian, segera hubungi
                                panitia melalui WhatsApp.
                            </p>
                            <button className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">chat</span>{" "}
                                Hubungi Panitia
                            </button>
                        </div>
                    </div>
                    {/* Main Content: Exam Card Preview */}
                    <div className="lg:col-span-8 flex flex-col w-full">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            Kartu Peserta Ujian
                                        </h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            Periksa data sebelum mencetak.
                                        </p>
                                    </div>
                                    <button className="bg-primary hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">
                                            print
                                        </span>
                                        Cetak PDF
                                    </button>
                                </div>
                                {/* The Card */}
                                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl overflow-x-auto">
                                    <div className="bg-white text-slate-900 w-full min-w-[620px] max-w-[700px] border-2 border-slate-800 p-8 mx-auto shadow-md relative">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b-[3px] border-double border-slate-800 pb-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-16 flex items-center justify-center border-2 border-slate-800 rounded-full">
                                                    <span className="material-symbols-outlined text-4xl">
                                                        school
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg uppercase leading-none">
                                                        Panitia PPDB
                                                    </h3>
                                                    <h2 className="font-black text-2xl uppercase leading-tight tracking-wide">
                                                        SMP Merdeka
                                                    </h2>
                                                    <p className="text-sm font-medium tracking-wider">
                                                        Tahun Pelajaran 2024/2025
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 inline-block mb-1 tracking-wider uppercase">
                                                    Kartu Peserta
                                                </div>
                                                <p className="text-[10px] font-mono">
                                                    No. Dok: 001/PPDB/2024
                                                </p>
                                            </div>
                                        </div>
                                        {/* Title */}
                                        <h2 className="text-center font-bold text-xl underline underline-offset-4 mb-6 uppercase tracking-wide">
                                            KARTU PESERTA UJIAN
                                        </h2>
                                        {/* Content */}
                                        <div className="flex gap-8">
                                            <div className="flex-1 space-y-2.5 text-sm">
                                                <div className="flex">
                                                    <span className="w-32 font-semibold">
                                                        Nomor Ujian
                                                    </span>
                                                    <span className="font-bold font-mono text-lg tracking-wide">
                                                        : 24-01-0892
                                                    </span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 font-semibold">
                                                        Nama Lengkap
                                                    </span>
                                                    <span className="uppercase font-bold">
                                                        : Budi Santoso
                                                    </span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 font-semibold">NISN</span>
                                                    <span className="font-mono">: 0012345678</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 font-semibold">
                                                        Asal Sekolah
                                                    </span>
                                                    <span>: SD Negeri 1 Harapan Bangsa</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 font-semibold">
                                                        Lokasi Ujian
                                                    </span>
                                                    <span className="leading-snug">
                                                        : Ruang 04 (Lab Komputer)
                                                        <br /> Gedung Utama, Lantai 2
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-32 h-40 border border-slate-400 bg-slate-50 flex flex-col items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-4xl text-slate-300">
                                                    person
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-2 text-center px-2">
                                                    Pas Foto 3x4
                                                </span>
                                            </div>
                                        </div>
                                        {/* Schedule */}
                                        <div className="mt-8">
                                            <h4 className="font-bold text-sm mb-2 border-l-4 border-slate-800 pl-2">
                                                Jadwal Ujian
                                            </h4>
                                            <table className="w-full text-sm border-collapse border border-slate-800">
                                                <thead>
                                                    <tr className="bg-slate-100 text-left">
                                                        <th className="border border-slate-800 p-2 text-center w-32 font-bold">
                                                            Hari/Tanggal
                                                        </th>
                                                        <th className="border border-slate-800 p-2 text-center w-32 font-bold">
                                                            Waktu
                                                        </th>
                                                        <th className="border border-slate-800 p-2 font-bold">
                                                            Mata Pelajaran
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-slate-800 p-2 text-center font-medium">
                                                            Senin, 20 Jun
                                                        </td>
                                                        <td className="border border-slate-800 p-2 text-center">
                                                            08:00 - 10:00
                                                        </td>
                                                        <td className="border border-slate-800 p-2">
                                                            Tes Potensi Akademik (TPA)
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-slate-800 p-2 text-center font-medium">
                                                            Senin, 20 Jun
                                                        </td>
                                                        <td className="border border-slate-800 p-2 text-center">
                                                            10:30 - 12:00
                                                        </td>
                                                        <td className="border border-slate-800 p-2">
                                                            Bahasa Inggris & Umum
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Disclaimer & Footer */}
                                        <div className="mt-8 flex justify-between items-end pt-4 border-t border-slate-300">
                                            <div className="text-[10px] text-slate-600 max-w-xs italic leading-tight">
                                                * Kartu ini adalah bukti sah mengikuti ujian seleksi.
                                                <br />* Harap dibawa saat pelaksanaan ujian beserta alat
                                                tulis.
                                            </div>
                                            <div className="text-center relative">
                                                <p className="text-xs mb-10">
                                                    Kota Merdeka, 18 Mei 2024
                                                    <br />
                                                    Ketua Panitia,
                                                </p>
                                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 border-2 border-primary/40 rounded-full flex items-center justify-center -rotate-12 opacity-50 pointer-events-none">
                                                    <span className="text-[8px] font-bold text-primary uppercase text-center leading-none">
                                                        Panitia
                                                        <br />
                                                        PPDB
                                                        <br />
                                                        2024
                                                    </span>
                                                </div>
                                                <div className="h-0 border-b border-slate-800 w-32 mx-auto"></div>
                                                <p className="text-xs font-bold mt-1">
                                                    Drs. H. Pendidik M.Pd
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mobile Print Button */}
                        <div className="mt-6 md:hidden">
                            <button className="w-full bg-primary hover:bg-blue-700 text-white text-sm font-bold py-3 px-5 rounded-lg shadow transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">
                                    print
                                </span>
                                Cetak Kartu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
