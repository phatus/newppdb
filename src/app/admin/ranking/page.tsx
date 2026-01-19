import { db } from "@/lib/db";
import { getRankingData } from "@/app/actions/ranking";
import RankingTable from "@/components/admin/RankingTable";
import WABlastPanel from "@/components/admin/WABlastPanel";

export default async function RankingPage() {
    const students = await getRankingData();
    const settings = await db.schoolSettings.findFirst();

    const wRapor = settings?.weightRapor ?? 40;
    const wUjian = settings?.weightUjian ?? 30;
    const wSKUA = settings?.weightSKUA ?? 30;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Perangkingan Siswa</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Daftar peringkat berdasarkan kalkulasi nilai Rapor, Ujian Teori, SKUA, dan Prestasi.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <WABlastPanel />
                </div>
            </div>

            <div className="bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <span>
                            Kalkulasi skor akhir menggunakan pembobotan spesifik sesuai <strong>Jalur Pendaftaran</strong>. Anda dapat menyesuaikan bobot (%) di menu <a href="/admin/settings#ranking" className="text-primary hover:underline font-bold">Pengaturan</a>.
                        </span>
                    </div>
                </div>

                <RankingTable initialData={students} />
            </div>
        </div>
    );
}
