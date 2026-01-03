"use client";

import { useState, useEffect } from "react";
import { getExamSchedules, createExamSchedule, deleteExamSchedule } from "@/app/actions/exam-schedule";
import { toast } from "react-hot-toast";

type Schedule = {
    id: string;
    dayDate: string;
    time: string;
    subject: string;
    order: number;
};

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [dayDate, setDayDate] = useState("");
    const [time, setTime] = useState("");
    const [subject, setSubject] = useState("");
    const [order, setOrder] = useState(1);

    const loadSchedules = async () => {
        setLoading(true);
        const data = await getExamSchedules();
        setSchedules(data);
        setLoading(false);
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await createExamSchedule({ dayDate, time, subject, order });
            if (res.success) {
                toast.success("Jadwal berhasil ditambahkan");
                setDayDate("");
                setTime("");
                setSubject("");
                setOrder(schedules.length + 1);
                loadSchedules();
            } else {
                toast.error(res.error || "Gagal menambahkan jadwal");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus jadwal ini?")) return;
        try {
            const res = await deleteExamSchedule(id);
            if (res.success) {
                toast.success("Jadwal dihapus");
                loadSchedules();
            } else {
                toast.error(res.error || "Gagal menghapus");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Jadwal Ujian</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-white dark:bg-[#1c2936] p-6 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tambah Jadwal</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Hari, Tanggal</label>
                            <input
                                type="text"
                                placeholder="Senin, 20 Juni 2025"
                                value={dayDate}
                                onChange={(e) => setDayDate(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Waktu</label>
                            <input
                                type="text"
                                placeholder="08:00 - 10:00"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Mata Pelajaran</label>
                            <input
                                type="text"
                                placeholder="Matematika"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Urutan</label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(parseInt(e.target.value))}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Menyimpan..." : "Tambah Jadwal"}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1c2936] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Jadwal</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Memuat data...</div>
                    ) : schedules.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Belum ada jadwal ujian.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 w-16">No</th>
                                        <th className="px-6 py-3">Hari/Tanggal</th>
                                        <th className="px-6 py-3">Waktu</th>
                                        <th className="px-6 py-3">Mapel</th>
                                        <th className="px-6 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {schedules.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-3 text-center">{idx + 1}</td>
                                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.dayDate}</td>
                                            <td className="px-6 py-3">{item.time}</td>
                                            <td className="px-6 py-3">{item.subject}</td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Hapus"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
