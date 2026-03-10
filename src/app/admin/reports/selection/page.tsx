export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import SelectionExportButton from "@/components/admin/reports/SelectionExportButton";
import PrintButton from "@/components/admin/PrintButton";
import WaveSelector from "@/components/admin/WaveSelector";
import { formatInWIB } from "@/lib/date-utils";
import { getRankingData } from "@/app/actions/ranking";
import PaginationControl from "@/components/admin/PaginationControl";

const PAGE_SIZE = 50;

export default async function SelectionRecapPage(props: {
    searchParams: Promise<{ waveId?: string; page?: string }>
}) {
    const searchParams = await props.searchParams;
    const waveId = searchParams.waveId;
    const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
    const skip = (currentPage - 1) * PAGE_SIZE;

    // Fetch all waves for the filter
    const waves = await db.wave.findMany({
        orderBy: { startDate: 'desc' }
    });

    // Fetch ranked students (this includes finalScore and LULUS/TIDAK_LULUS status)
    // We only want those who are already processed (LULUS or TIDAK_LULUS)
    const { students: allRanked } = await getRankingData({ waveId });
    const allFilteredStudents = allRanked.filter(s => s.statusKelulusan === "LULUS" || s.statusKelulusan === "TIDAK_LULUS");

    // Paginate the filtered list
    const students = allFilteredStudents.slice(skip, skip + PAGE_SIZE);
    const totalCount = allFilteredStudents.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const settings: any = await db.schoolSettings.findFirst();
    const cityOnly = (settings?.schoolCity || "Pacitan").split(',')[0].trim();
    const selectedWave = waves.find(w => w.id === waveId);

    const totalAccepted = allFilteredStudents.filter(s => s.statusKelulusan === "LULUS").length;
    const totalRejected = allFilteredStudents.filter(s => s.statusKelulusan === "TIDAK_LULUS").length;

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between no-print">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/admin/reports" className="hover:text-primary">Laporan</Link>
                        <span>/</span>
                        <span>Rekap Seleksi</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Rekapitulasi Hasil Seleksi
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <WaveSelector waves={waves} initialWaveId={waveId} />
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                    <SelectionExportButton students={allFilteredStudents} />
                    <PrintButton />
                </div>
            </div>

            {/* Summary Cards no-print */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1 font-medium">Total Diproses</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</h3>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1 font-medium">Diterima</p>
                    <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{totalAccepted}</h3>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-800 shadow-sm">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1 font-medium">TIDAK Diterima</p>
                    <h3 className="text-2xl font-black text-red-700 dark:text-red-300">{totalRejected}</h3>
                </div>
            </div>

            {/* Printable Area */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
                {/* Kop / Header for Print */}
                <div className="hidden print:flex items-center justify-center gap-6 mb-8 border-b-2 border-black pb-4">
                    {settings?.schoolLogo && (
                        <img src={settings.schoolLogo} alt="Logo" className="h-20 w-20 object-contain" />
                    )}
                    <div className="text-center">
                        <h2 className="text-xl font-bold uppercase">Rekapitulasi Hasil Seleksi Murid Baru</h2>
                        <h3 className="text-lg font-bold uppercase">{settings?.schoolName || "MTsN 1 Pacitan"}</h3>
                        <p className="text-sm font-serif italic">{settings?.schoolAddress || "-"}</p>
                    </div>
                </div>

                <div className="mb-4 flex justify-between items-end">
                    <div>
                        <h4 className="font-bold text-lg">Daftar Hasil Seleksi (Lulus & Tidak Lulus)</h4>
                        {selectedWave && <p className="text-xs text-slate-500 font-bold">Gelombang: {selectedWave.name}</p>}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-slate-200 print:border-black">
                        <thead>
                            <tr className="bg-slate-50 print:bg-slate-100 text-slate-900 border-y border-slate-200 print:border-black">
                                <th className="py-3 px-4 text-left font-bold w-12 border border-slate-200 print:border-black">No</th>
                                <th className="py-3 px-4 text-left font-bold border border-slate-200 print:border-black">Nama Lengkap</th>
                                <th className="py-3 px-4 text-left font-bold border border-slate-200 print:border-black">NISN</th>
                                <th className="py-3 px-4 text-left font-bold border border-slate-200 print:border-black">Jalur</th>
                                <th className="py-3 px-4 text-left font-bold border border-slate-200 print:border-black w-24 text-center">Skor</th>
                                <th className="py-3 px-4 text-left font-bold border border-slate-200 print:border-black w-32 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 border-b border-slate-200 print:divide-black print:border-black">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">Belum ada data seleksi untuk ditampilkan.</td>
                                </tr>
                            ) : (
                                students.map((student: any, index: number) => (
                                    <tr key={student.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                                        <td className="py-2.5 px-4 text-slate-500 print:text-black border border-slate-200 print:border-black text-center">
                                            {skip + index + 1}
                                        </td>
                                        <td className="py-2.5 px-4 font-medium text-slate-900 print:text-black border border-slate-200 print:border-black">
                                            {student.namaLengkap}
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-600 print:text-black border border-slate-200 print:border-black">{student.nisn}</td>
                                        <td className="py-2.5 px-4 text-slate-600 print:text-black border border-slate-200 print:border-black">
                                            {student.jalur?.replace(/_/g, " ")}
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-600 print:text-black border border-slate-200 print:border-black text-center font-bold">
                                            {student.grades?.finalScore?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="py-2.5 px-4 border border-slate-200 print:border-black text-center">
                                            <span className={`
                                                inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                ${student.statusKelulusan === 'LULUS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                print:bg-transparent print:text-black
                                            `}>
                                                {student.statusKelulusan === 'LULUS' ? 'DITERIMA' : 'TIDAK LOLOS'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Signature for Print */}
                <div className="hidden print:flex justify-end mt-12 pr-8">
                    <div className="text-center min-w-[200px]">
                        <p className="mb-2">{cityOnly}, {formatInWIB(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="mb-2 uppercase font-bold text-xs">Ketua Panitia PMBM,</p>
                        {settings?.committeeSignature ? (
                            <div className="h-16 flex items-center justify-center mb-2">
                                <img src={settings.committeeSignature} alt="Signature" className="h-full object-contain" />
                            </div>
                        ) : (
                            <div className="h-16" />
                        )}
                        <p className="font-bold border-b border-black inline-block min-w-[150px] uppercase">{settings?.committeeName || "Ketua Panitia"}</p>
                        {settings?.committeeNip && <p className="text-xs">NIP. {settings.committeeNip}</p>}
                    </div>
                </div>

                {/* Pagination - only visible on screen */}
                <div className="mt-6 no-print border-t border-slate-100 pt-4">
                    <PaginationControl
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalCount}
                        itemsPerPage={PAGE_SIZE}
                    />
                </div>
            </div>

            {/* Print Styles helper */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; color: black; font-family: "Times New Roman", serif; }
                    .print\\:shadow-none { box-shadow: none; }
                    .print\\:border-none { border: none; }
                    table, th, td { border: 1px solid black !important; border-collapse: collapse !important; }
                    th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
}
