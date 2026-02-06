import { db } from "@/lib/db";
import Link from "next/link";
import { getRankingData } from "@/app/actions/ranking";
import PrintButton from "@/components/admin/PrintButton";
import AutoSelectionButton from "@/components/admin/AutoSelectionButton";

export default async function RankingReportPage() {
    // Reuse existing ranking logic
    const rankedStudents = await getRankingData();

    // Use Raw Query to fetch settings to avoid stale Prisma Client issues
    const settingsRaw = await db.$queryRaw<import("@prisma/client").SchoolSettings[]>`SELECT * FROM "SchoolSettings" LIMIT 1`;
    const settings = settingsRaw[0] || {};

    // Fix for double date: Take only the city name part if comma exists
    const rawCity = settings?.schoolCity || "Pacitan";
    const cityOnly = rawCity.split(',')[0].trim();

    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Link href="/admin/reports" className="hover:text-primary">Laporan</Link>
                    <span>/</span>
                    <span>Berita Acara</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Berita Acara Ranking
                </h1>
                <div className="flex gap-2">
                    <AutoSelectionButton quota={settings?.studentQuota || 100} />
                    <PrintButton />
                </div>
            </div>

            {/* Printable Document */}
            <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 min-h-[1000px] print:min-h-0 relative">

                {/* Kop Surat */}
                <div className="border-b-4 border-double border-black pb-4 mb-8 text-center flex items-center justify-center gap-6">
                    {settings?.schoolLogo && (
                        <img src={settings.schoolLogo} alt="Logo" className="h-24 w-24 object-contain" />
                    )}
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <h2 className="text-xl font-bold">Panitia Penerimaan Murid Baru</h2>
                        <h1 className="text-2xl font-black">{settings?.schoolName || "MTsN 1 Pacitan"}</h1>
                        <p className="text-sm font-serif italic">{settings?.schoolAddress || "Jl. Alamat Madrasah"}</p>
                    </div>
                </div>

                {/* Judul Berita Acara */}
                <div className="text-center mb-8">
                    <h3 className="text-lg font-bold underline underline-offset-4 uppercase">Berita Acara Hasil Seleksi</h3>
                    <p className="text-sm mt-1">Nomor: ........................................................................</p>
                </div>

                {/* Isi */}
                <div className="text-justify mb-6 leading-relaxed">
                    <p className="mb-4">
                        Pada hari ini <strong>{dateStr}</strong>, bertempat di {settings?.schoolName || "Madrasah Tsyanawiyah Negeri 1 Pacitan"}, Panitia PMBM telah melaksanakan rapat pleno penetapan hasil seleksi calon murid baru Tahun Pelajaran {settings?.academicYear || "2024/2025"}.
                    </p>
                    <p>
                        Berdasarkan hasil verifikasi berkas, nilai rapor, dan prestasi, maka ditetapkan daftar peringkat calon murid sebagai berikut:
                    </p>
                </div>

                {/* Table */}
                <div className="mb-8">
                    <table className="w-full text-sm border-collapse border border-black">
                        <thead>
                            <tr className="bg-slate-100 text-black">
                                <th className="border border-black py-2 px-2 w-12">Rank</th>
                                <th className="border border-black py-2 px-3 text-left">Nama Lengkap</th>
                                <th className="border border-black py-2 px-3 text-left">NISN</th>
                                <th className="border border-black py-2 px-3 text-left">Asal Sekolah</th>
                                <th className="border border-black py-2 px-3 text-left">Jalur</th>
                                <th className="border border-black py-2 px-2 w-20">Total Skor</th>
                                <th className="border border-black py-2 px-2 text-center w-24">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="border border-black py-8 text-center italic">Tidak ada data murid untuk ditampilkan.</td>
                                </tr>
                            ) : (
                                rankedStudents.map((s, idx) => (
                                    <tr key={s.id}>
                                        <td className="border border-black py-2 px-2 text-center font-bold">{idx + 1}</td>
                                        <td className="border border-black py-2 px-3">
                                            {s.namaLengkap}
                                        </td>
                                        <td className="border border-black py-2 px-3">{s.nisn}</td>
                                        <td className="border border-black py-2 px-3">{s.asalSekolah}</td>
                                        <td className="border border-black py-2 px-3">
                                            {s.jalur === 'PRESTASI_AKADEMIK' ? 'Prestasi Akd' :
                                                s.jalur === 'PRESTASI_NON_AKADEMIK' ? 'Prestasi Non-Akd' :
                                                    s.jalur === 'REGULER' ? 'Reguler' :
                                                        s.jalur === 'AFIRMASI' ? 'Afirmasi' : s.jalur}
                                        </td>
                                        <td className="border border-black py-2 px-2 text-center font-bold">{s.grades?.finalScore?.toFixed(2)}</td>
                                        <td className="border border-black py-2 px-2 text-center">
                                            {/* Dummy Logic: LULUS if within Top X */}
                                            {s.statusKelulusan === 'LULUS' ? 'DITERIMA' :
                                                s.statusKelulusan === 'TIDAK_LULUS' ? 'TIDAK DITERIMA' :
                                                    s.statusKelulusan || 'PENDING'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / TTD */}
                <div className="flex justify-between mt-16 px-12 break-inside-avoid">
                    <div className="text-center">
                        <p className="mb-20">Mengetahui,<br />Kepala Madrasah</p>
                        <p className="font-bold underline">{settings?.principalName || "Nama Kepala Sekolah"}</p>
                        <p>NIP. {settings?.principalNip || "-"}</p>
                    </div>
                    <div className="text-center">
                        <p className="mb-4">Ditetapkan di: {cityOnly}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />Ketua Panitia PMBM</p>
                        {settings?.committeeSignature ? (
                            <div className="h-20 flex items-center justify-center mb-2">
                                <img src={settings.committeeSignature} alt="Signature" className="h-full object-contain" />
                            </div>
                        ) : (
                            <div className="h-20" />
                        )}
                        <p className="font-bold underline">{settings?.committeeName || "Nama Ketua Panitia"}</p>
                        <p>NIP. {settings?.committeeNip || "-"}</p>
                    </div>
                </div>

            </div>

            {/* Print Styles helper */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                    .print\\:shadow-none { box-shadow: none; }
                    .print\\:border-none { border: none; }
                    .print\\:min-h-0 { min-height: 0; }
                }
            `}} />
        </div>
    );
}
