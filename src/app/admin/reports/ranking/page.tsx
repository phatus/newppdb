export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import { getRankingData } from "@/app/actions/ranking";
import PrintButton from "@/components/admin/PrintButton";
import AutoSelectionButton from "@/components/admin/AutoSelectionButton";
import UndoSelectionButton from "@/components/admin/UndoSelectionButton";
import WaveSelector from "@/components/admin/WaveSelector";
import ExportDocButton from "@/components/admin/ExportDocButton";

export default async function RankingReportPage(props: {
    searchParams: Promise<{ waveId?: string }>
}) {
    const searchParams = await props.searchParams;
    const waveId = searchParams.waveId;

    // Fetch all waves for the filter
    const waves = await db.wave.findMany({
        orderBy: { startDate: 'desc' }
    });

    // Reuse existing ranking logic with filter
    const { students: rankedStudents } = await getRankingData({ waveId, forceLive: true });

    // Use Raw Query to fetch settings
    const settingsRaw = await db.$queryRaw<import("@prisma/client").SchoolSettings[]>`SELECT * FROM "SchoolSettings" LIMIT 1`;
    const settings = settingsRaw[0] || {};

    // Fix for double date
    const rawCity = settings?.schoolCity || "Pacitan";
    const cityOnly = rawCity.split(',')[0].trim();
    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const selectedWave = waves.find(w => w.id === waveId);

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between no-print gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/admin/reports" className="hover:text-primary">Laporan & Cetak</Link>
                        <span>/</span>
                        <span>Berita Acara</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Berita Acara Ranking
                    </h1>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                    <WaveSelector waves={waves} initialWaveId={waveId} />
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
                    <UndoSelectionButton waveId={waveId} />
                    <AutoSelectionButton quota={settings?.studentQuota || 100} waveId={waveId} />
                    <ExportDocButton targetId="berita-acara-doc" fileName="Berita_Acara_Ranking" />
                    <PrintButton />
                </div>
            </div>

            {/* Printable Document */}
            <div id="berita-acara-doc" className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 min-h-[1000px] print:min-h-0 relative">
                {/* Kop Surat */}
                <table className="w-full border-b-4 border-double border-black pb-4 mb-8">
                    <tbody>
                        <tr>
                            <td className="w-24 align-middle text-center border-0 border-b-0 pb-4">
                                {settings?.schoolLogo && (
                                    <img src={settings.schoolLogo} alt="Logo" className="h-24 w-24 object-contain mx-auto" />
                                )}
                            </td>
                            <td className="text-center align-middle border-0 border-b-0 pb-4">
                                <h2 className="text-xl font-bold m-0 p-0">Panitia Penerimaan Murid Baru</h2>
                                <h1 className="text-2xl font-black m-0 p-0 leading-tight">{settings?.schoolName || "MTsN 1 Pacitan"}</h1>
                                <p className="text-sm font-serif italic m-0 p-0">{settings?.schoolAddress || "Jl. Alamat Madrasah"}</p>
                            </td>
                            <td className="w-24 border-0 border-b-0 pb-4">
                                {/* Empty right col to balance the left logo */}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Judul Berita Acara */}
                <div className="text-center mb-8">
                    <h3 className="text-lg font-bold underline underline-offset-4 uppercase">Berita Acara Hasil Seleksi</h3>
                    {selectedWave && <p className="text-sm mt-1 font-bold">Gelombang: {selectedWave.name}</p>}
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
                <table className="w-full mt-16 break-inside-avoid border-0">
                    <tbody>
                        <tr>
                            <td className="w-1/2 text-center align-top border-0">
                                <p className="mb-20 mt-4">Mengetahui,<br />Kepala Madrasah</p>
                                <p className="font-bold underline">{settings?.principalName || "Nama Kepala Sekolah"}</p>
                                <p>NIP. {settings?.principalNip || "-"}</p>
                            </td>
                            <td className="w-1/2 text-center align-top border-0">
                                <p className="mb-4">Ditetapkan di: {cityOnly}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />Ketua Panitia PMBM</p>
                                {settings?.committeeSignature ? (
                                    <div className="h-20 flex items-center justify-center mb-2">
                                        <img src={settings.committeeSignature} alt="Signature" className="h-20 object-contain mx-auto" />
                                    </div>
                                ) : (
                                    <div className="h-20" />
                                )}
                                <p className="font-bold underline">{settings?.committeeName || "Nama Ketua Panitia"}</p>
                                <p>NIP. {settings?.committeeNip || "-"}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>

            {/* Print Styles helper */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; margin: 0; padding: 0; }
                    @page { size: A4 portrait; margin: 15mm; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:min-h-0 { min-height: 0 !important; }
                    
                    /* TTD Borders fix for print based on table layout */
                    .border-0 { border: none !important; }
                    .border-b-0 { border-bottom: none !important; }

                    /* Fix page breaks */
                    table { page-break-inside: auto; break-inside: auto; border-collapse: collapse; }
                    tr { page-break-inside: avoid; page-break-after: auto; break-inside: avoid; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    
                    /* Make sure borders are printed for main table */
                    table.text-sm th, table.text-sm td { border: 1px solid black !important; }
                    
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}} />
        </div>
    );
}
