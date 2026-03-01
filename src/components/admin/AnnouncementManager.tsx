"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement, Announcement } from "@/app/actions/announcements";
import { useRouter } from "next/navigation";

export default function AnnouncementManager({ announcements }: { announcements: Announcement[] }) {
    const router = useRouter();
    const [isInternalLoading, setIsInternalLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "INFO",
        target: "ALL",
        image: "" as string | null
    });

    const resetForm = () => {
        setFormData({ title: "", content: "", type: "INFO", target: "ALL", image: null });
        setEditingId(null);
    };

    const handleEdit = (announcement: Announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            target: announcement.target,
            image: announcement.image
        });
        setEditingId(announcement.id);
        setShowModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsInternalLoading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });
            const data = await res.json();
            if (res.ok) {
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success("Foto berhasil diunggah");
            } else {
                toast.error(data.message || "Gagal mengunggah foto");
            }
        } catch (error) {
            toast.error("Gagal mengunggah foto");
        } finally {
            setIsInternalLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInternalLoading(true);

        const res = editingId
            ? await updateAnnouncement(editingId, formData)
            : await createAnnouncement(formData);

        if (res.success) {
            toast.success(editingId ? "Pengumuman diperbarui" : "Pengumuman berhasil dibuat");
            setShowModal(false);
            resetForm();
            router.refresh();
        } else {
            toast.error(res.error || "Gagal menyimpan pengumuman");
        }
        setIsInternalLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus pengumuman ini?")) return;

        const res = await deleteAnnouncement(id);
        if (res.success) {
            toast.success("Terhapus");
            router.refresh();
        } else {
            toast.error("Gagal menghapus");
        }
    };

    const handleToggle = async (id: string, current: boolean) => {
        const res = await toggleAnnouncement(id, current);
        if (res.success) {
            router.refresh();
        } else {
            toast.error("Gagal mengubah status");
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "IMPORTANT": return "bg-red-100 text-red-800 border-red-200";
            case "WARNING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Daftar Pengumuman</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all font-bold text-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Buat Pengumuman
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {announcements.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500">Belum ada pengumuman.</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item.id} className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${item.isActive ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 opacity-70 bg-slate-50'}`}>
                            <div className="flex-1 space-y-2 flex gap-4 items-start">
                                {item.image && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeColor(item.type)}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">group</span>
                                            {item.target}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.content}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center">
                                <button
                                    onClick={() => handleEdit(item)}
                                    title="Edit"
                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button
                                    onClick={() => handleToggle(item.id, item.isActive)}
                                    title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                                    className={`p-2 rounded-lg transition-colors ${item.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                                >
                                    <span className="material-symbols-outlined">{item.isActive ? 'visibility' : 'visibility_off'}</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Hapus"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Judul</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                                    placeholder="Contoh: Jadwal Ujian Diundur"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Tipe</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                                    >
                                        <option value="INFO">Informasi</option>
                                        <option value="WARNING">Peringatan</option>
                                        <option value="IMPORTANT">Penting</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Target</label>
                                    <select
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                                    >
                                        <option value="ALL">Semua</option>
                                        <option value="USER">Pendaftar</option>
                                        <option value="VERIFIED">Terverifikasi</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 px-1">Gambar (Opsional)</label>
                                <div className="flex items-center gap-4">
                                    {formData.image ? (
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                            <span className="material-symbols-outlined text-slate-400">add_photo_alternate</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                    <p className="text-[11px] text-slate-500 flex-1">
                                        Klik untuk unggah gambar pendukung pengumuman. Format JPG/PNG, max 2MB.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Isi Pengumuman</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                                    placeholder="Tulis detail pengumuman di sini..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isInternalLoading}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm"
                                >
                                    {isInternalLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {editingId ? 'Simpan' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
