export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import ExportButton from "@/components/admin/students/ExportButton";
import PrintButton from "@/components/admin/PrintButton";
import { formatInWIB } from "@/lib/date-utils";

export default async function RecapPage(props: {
    searchParams: Promise<{ waveId?: string }>
}) {
    const searchParams = await props.searchParams;
    const waveId = searchParams.waveId;

    // Fetch all waves for the filter
    const waves = await db.wave.findMany({
        orderBy: { startDate: 'desc' }
    });

    // Build query
    const where: any = {};
    if (waveId && waveId !== "all") {
        where.waveId = waveId;
    }

    // Fetch students based on filter
    const students = await db.student.findMany({
        where,
        orderBy: { namaLengkap: 'asc' },
        include: {
            user: {
                select: { email: true, phoneNumber: true }
            },
            grades: true
        }
    });

    const settings: any = await db.schoolSettings.findFirst();
    const cityOnly = (settings?.schoolCity || "Karanganyar").split(',')[0].trim();
    const selectedWave = waves.find(w => w.id === waveId);

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between no-print">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/admin/reports" className="hover:text-primary">Laporan</Link>
                        <span>/</span>
                        <span>Rekapitulasi</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Rekapitulasi Data Pendaftar
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <form className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gelombang:</span>
                        <select
                            name="waveId"
                            defaultValue={waveId || "all"}
                            // @ts-ignore
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                url.searchParams.set("waveId", e.target.value);
                                window.location.href = url.toString();
                            }}
                            className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-primary/20"
                        >
                            <option value="all">Semua Gelombang</option>
                            {waves.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </form>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                    <ExportButton students={students} />
                    <PrintButton />
                </div>
            </div>

            {/* Printable Area */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
                {/* Kop / Header for Print */}
                <div className="hidden print:flex items-center justify-center gap-6 mb-8 border-b-2 border-black pb-4">
                    {settings?.schoolLogo && (
                        <img src={settings.schoolLogo} alt="Logo" className="h-16 w-16 object-contain" />
                    )}
                    <div className="text-center">
                        <h2 className="text-xl font-bold">Panitia Penerimaan Murid Baru (PMBM)</h2>
                        <h3 className="text-lg font-bold">{settings?.schoolName || "SDIT Insan Kamil Karanganyar"}</h3>
                        <p className="text-sm">Tahun Pelajaran {settings?.academicYear || "2024/2025"}</p>
                    </div>
                </div>

                <div className="mb-4 flex justify-between items-end">
                    <div>
                        <h4 className="font-bold text-lg">Data Pendaftar Masuk</h4>
                        {selectedWave && <p className="text-xs text-slate-500 font-medium">Gelombang: {selectedWave.name}</p>}
                    </div>
                    <span className="text-sm text-slate-500">Total: {students.length} Murid</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50 print:bg-slate-100 text-slate-900 border-y border-slate-200 print:border-black">
                                <th className="py-3 px-4 text-left font-bold w-12">No</th>
                                <th className="py-3 px-4 text-left font-bold">Nama Lengkap</th>
                                <th className="py-3 px-4 text-left font-bold">NISN</th>
                                <th className="py-3 px-4 text-left font-bold">Asal Sekolah</th>
                                <th className="py-3 px-4 text-left font-bold">Jalur</th>
                                <th className="py-3 px-4 text-left font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 border-b border-data-200 print:divide-slate-300 print:border-black">
                            {students.map((student: any, index: number) => (
                                <tr key={student.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                                    <td className="py-2 px-4 text-slate-500 print:text-black align-top">{index + 1}</td>
                                    <td className="py-2 px-4 font-medium text-slate-900 print:text-black align-top">
                                        {student.namaLengkap}
                                        <div className="text-xs text-slate-400 print:hidden">{student.user?.email}</div>
                                    </td>
                                    <td className="py-2 px-4 text-slate-600 print:text-black align-top">{student.nisn}</td>
                                    <td className="py-2 px-4 text-slate-600 print:text-black align-top">{student.asalSekolah}</td>
                                    <td className="py-2 px-4 text-slate-600 print:text-black align-top">{student.jalur}</td>
                                    <td className="py-2 px-4 align-top">
                                        <span className={`
                                            inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                                            ${student.statusVerifikasi === 'VERIFIED' ? 'bg-green-100 text-green-700 print:bg-transparent print:text-black print:border print:border-black' :
                                                student.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-700 print:bg-transparent print:text-black' :
                                                    'bg-amber-100 text-amber-700 print:bg-transparent print:text-black'}
                                        `}>
                                            {student.statusVerifikasi}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Signature for Print */}
                <div className="hidden print:flex justify-end mt-12 pr-8">
                    <div className="text-center min-w-[200px]">
                        <p className="mb-2">{cityOnly}, {formatInWIB(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="mb-2">Ketua Panitia,</p>
                        {settings?.committeeSignature ? (
                            <div className="h-16 flex items-center justify-center mb-2">
                                <img src={settings.committeeSignature} alt="Signature" className="h-full object-contain" />
                            </div>
                        ) : (
                            <div className="h-16" />
                        )}
                        <p className="font-bold border-b border-black inline-block min-w-[150px]">{settings?.committeeName || "Ketua Panitia"}</p>
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
                }
            `}} />
        </div>
    );
}
