import { db } from "@/lib/db";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import AcademicSettings from "@/components/admin/settings/AcademicSettings";
import ScheduleSettings from "@/components/admin/settings/ScheduleSettings";
import RankingSettings from "@/components/admin/settings/RankingSettings";
import CommitteeSettings from "@/components/admin/settings/CommitteeSettings";
import WASettings from "@/components/admin/settings/WASettings";
import QuotaSettings from "@/components/admin/settings/QuotaSettings";
import WeightSettings from "@/components/admin/settings/WeightSettings";

export default async function SettingsPage() {
    const settings = await db.schoolSettings.findFirst();

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Aplikasi</h1>
                <p className="text-slate-500 dark:text-slate-400">Kelola identitas sekolah, tahun ajaran, jadwal, dan bobot perangkingan.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                <div className="xl:col-span-3 space-y-8">
                    {/* General Settings */}
                    <section id="general" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">school</span>
                            Identitas Sekolah
                        </h2>
                        <GeneralSettings initialData={settings} />
                    </section>

                    {/* Committee Settings */}
                    <section id="committee" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_check</span>
                            Informasi Panitia
                        </h2>
                        <CommitteeSettings initialData={settings} />
                    </section>

                    {/* Schedule Settings */}
                    <section id="schedule" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            Jadwal PPDB
                        </h2>
                        <ScheduleSettings initialData={settings} />
                    </section>

                    {/* Academic Settings */}
                    <section id="academic" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_calendar</span>
                            Tahun Ajaran & Status Pendaftaran
                        </h2>
                        <AcademicSettings initialData={settings} />
                    </section>

                    {/* Ranking Weights */}
                    <section id="ranking" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">leaderboard</span>
                            Bobot Perangkingan
                        </h2>

                        <div className="space-y-10">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border-l-4 border-primary">Bobot Per Jalur (Rekomendasi)</h3>
                                <WeightSettings initialSettings={settings} />
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-500 mb-4">Bobot Global (Legacy/Cadangan)</h3>
                                <RankingSettings initialData={settings} />
                            </div>
                        </div>
                    </section>

                    {/* Quota Settings */}
                    <section id="quota" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">pie_chart</span>
                            Kuota Penerimaan
                        </h2>
                        <QuotaSettings settings={settings} />
                    </section>

                    {/* WhatsApp Settings */}
                    <section id="whatsapp" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">chat</span>
                            Notifikasi WhatsApp
                        </h2>
                        <WASettings initialData={settings} />
                    </section>
                </div>

                {/* Quick Navigation */}
                <div className="hidden xl:block xl:col-span-1 sticky top-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 px-2">Menu Cepat</h3>
                        <nav className="flex flex-col gap-1">
                            <a href="#general" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">school</span>
                                Identitas Sekolah
                            </a>
                            <a href="#committee" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">person_check</span>
                                Informasi Panitia
                            </a>
                            <a href="#schedule" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Jadwal PPDB
                            </a>
                            <a href="#academic" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                                Tahun Ajaran
                            </a>
                            <a href="#ranking" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all font-medium text-primary bg-primary/5">
                                <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                                Bobot Ranking
                            </a>
                            <a href="#quota" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                                Kuota
                            </a>
                            <a href="#whatsapp" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary rounded-lg transition-all">
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                WhatsApp Gateway
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
