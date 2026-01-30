"use client";

import { useState } from "react";
import { updateSchedule } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    description: string;
}

interface ScheduleSettingsProps {
    initialData: any;
}

export default function ScheduleSettings({ initialData }: ScheduleSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<ScheduleEvent[]>(
        initialData?.ppdbSchedule || [
            { id: "1", title: "Pendaftaran Online", date: "1 - 5 Juli 2024", description: "Calon murid melakukan pembuatan akun dan pengisian formulir pendaftaran secara mandiri melalui laman website." },
            { id: "2", title: "Verifikasi & Validasi Berkas", date: "2 - 6 Juli 2024", description: "Panitia SPMB sekolah melakukan verifikasi berkas yang telah diunggah oleh calon murid." },
            { id: "3", title: "Pengumuman Hasil Seleksi", date: "8 Juli 2024", description: "Pengumuman hasil seleksi dapat dilihat melalui akun masing-masing peserta atau di papan pengumuman sekolah." },
            { id: "4", title: "Daftar Ulang", date: "9 - 11 Juli 2024", description: "Murid yang diterima wajib melakukan daftar ulang dengan membawa berkas fisik asli ke sekolah." },
        ]
    );

    const handleAddEvent = () => {
        const newEvent: ScheduleEvent = {
            id: Date.now().toString(),
            title: "Kegiatan Baru",
            date: "Tanggal Pelaksanaan",
            description: "Deskripsi kegiatan..."
        };
        setEvents([...events, newEvent]);
    };

    const handleRemoveEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const handleChange = (id: string, field: keyof ScheduleEvent, value: string) => {
        setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await updateSchedule(events);

        if (res.success) {
            toast.success("Jadwal SPMB berhasil disimpan");
        } else {
            toast.error(res.error || "Gagal menyimpan jadwal");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Kegiatan</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Atur jadwal kegiatan SPMB yang akan ditampilkan di halaman depan.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddEvent}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Tambah Kegiatan
                    </button>
                </div>

                <div className="space-y-4">
                    {events.map((event, index) => (
                        <div key={event.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-4 items-start group">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-sm mt-1">
                                {index + 1}
                            </div>
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Nama Kegiatan</label>
                                    <input
                                        type="text"
                                        value={event.title}
                                        onChange={(e) => handleChange(event.id, "title", e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50"
                                        placeholder="Contoh: Pendaftaran Online"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Waktu Pelaksanaan</label>
                                    <input
                                        type="text"
                                        value={event.date}
                                        onChange={(e) => handleChange(event.id, "date", e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50"
                                        placeholder="Contoh: 1 - 5 Juli 2024"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi</label>
                                    <textarea
                                        rows={2}
                                        value={event.description}
                                        onChange={(e) => handleChange(event.id, "description", e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                                        placeholder="Deskripsi singkat kegiatan..."
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveEvent(event.id)}
                                className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                                title="Hapus Kegiatan"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-8 text-slate-500 italic text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                            Belum ada jadwal kegiatan. Klik "Tambah Kegiatan" untuk memulai.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm shadow-primary/20"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            Simpan Jadwal
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
