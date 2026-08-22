"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AcademicYearFilter from "@/components/admin/AcademicYearFilter";
import {
    getOrientationClasses,
    generateOrientationClasses,
    moveStudentToClass,
    resetOrientationClasses,
} from "@/app/actions/orientation-class";
import toast from "react-hot-toast";

function ClassesContent() {
    const searchParams = useSearchParams();
    const academicYear = searchParams.get("academicYear") || "";

    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isMoving, setIsMoving] = useState(false);

    const [classesData, setClassesData] = useState<any[]>([]);
    const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
    const [totalAccepted, setTotalAccepted] = useState(0);

    // Form states
    const [capacityInput, setCapacityInput] = useState<number>(32);
    const [prefixInput, setPrefixInput] = useState<string>("Kelas Matsama");

    // Modal state for moving student
    const [selectedStudentForMove, setSelectedStudentForMove] = useState<any | null>(null);
    const [targetClassIdInput, setTargetClassIdInput] = useState<string>("");

    // Active Tab or Filter state
    const [activeTab, setActiveTab] = useState<string>("all");

    useEffect(() => {
        loadData();
    }, [academicYear]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getOrientationClasses(academicYear);
            if (res.success) {
                setClassesData(res.classes || []);
                setUnassignedStudents(res.unassignedStudents || []);
                setTotalAccepted(res.totalAcceptedStudents || 0);
            } else {
                toast.error(res.error || "Gagal memuat kelas orientasi");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await generateOrientationClasses({
                academicYear,
                capacityPerClass: capacityInput,
                namePrefix: prefixInput,
            });

            if (res.success) {
                toast.success(res.message || "Berhasil membagi kelas!");
                await loadData();
            } else {
                toast.error(res.error || "Gagal membagi kelas");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus seluruh pembagian kelas orientasi pada tahun pelajaran ini?")) {
            return;
        }

        setIsResetting(true);
        try {
            const res = await resetOrientationClasses(academicYear);
            if (res.success) {
                toast.success(res.message || "Berhasil mereset pembagian kelas");
                await loadData();
            } else {
                toast.error(res.error || "Gagal mereset kelas");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsResetting(false);
        }
    };

    const handleMoveStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentForMove) return;

        setIsMoving(true);
        try {
            const res = await moveStudentToClass({
                studentId: selectedStudentForMove.id,
                targetClassId: targetClassIdInput === "none" ? null : targetClassIdInput,
            });

            if (res.success) {
                toast.success("Berhasil memindahkan siswa");
                setSelectedStudentForMove(null);
                await loadData();
            } else {
                toast.error(res.error || "Gagal memindahkan siswa");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsMoving(false);
        }
    };

    const handleExportExcel = () => {
        if (classesData.length === 0) {
            toast.error("Belum ada kelas yang dibuat untuk diexport");
            return;
        }

        const url = academicYear ? `/api/admin/classes/export?academicYear=${encodeURIComponent(academicYear)}` : "/api/admin/classes/export";
        window.location.href = url;
    };

    const totalAssignedStudents = classesData.reduce((acc, c) => acc + c.totalStudents, 0);
    const totalMaleCount = classesData.reduce((acc, c) => acc + c.maleCount, 0);
    const totalFemaleCount = classesData.reduce((acc, c) => acc + c.femaleCount, 0);

    const filteredClasses = activeTab === "all" ? classesData : classesData.filter(c => c.id === activeTab);

    if (isLoading) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] gap-3">
                <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
                <p className="text-sm font-medium text-slate-500">Memuat data kelas orientasi (Matsama)...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">co_present</span>
                        Kelas Orientasi Siswa (Matsama)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Pembagian kelas sementara untuk siswa diterima (LULUS) dengan komposisi gender seimbang.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <AcademicYearFilter />
                    {classesData.length > 0 && (
                        <>
                            <button
                                onClick={handleExportExcel}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <span className="material-symbols-outlined text-base">file_download</span>
                                Export Excel (.xlsx)
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-slate-700 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <span className="material-symbols-outlined text-base">print</span>
                                Cetak Rekap
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">how_to_reg</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Siswa Diterima</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalAccepted} <span className="text-xs font-normal text-slate-500">murid</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">class</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kelas Terbentuk</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{classesData.length} <span className="text-xs font-normal text-slate-500">kelas</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">wc</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keseimbangan Gender</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400">👨 {totalMaleCount} L</span>
                            <span>|</span>
                            <span className="text-pink-600 dark:text-pink-400">👩 {totalFemaleCount} P</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${unassignedStudents.length > 0 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                        <span className="material-symbols-outlined text-2xl">pending</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Belum Punya Kelas</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{unassignedStudents.length} <span className="text-xs font-normal text-slate-500">murid</span></p>
                    </div>
                </div>
            </div>

            {/* Generator Settings Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-base">auto_awesome</span>
                            Pengaturan & Bagi Kelas Otomatis
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Sistem akan secara otomatis membagi siswa LULUS ke dalam kelas dengan jumlah siswa laki-laki dan perempuan yang seimbang.
                        </p>
                    </div>
                    {classesData.length > 0 && (
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isResetting}
                            className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1 shrink-0"
                        >
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                            Reset Pembagian
                        </button>
                    )}
                </div>

                <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-4">
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Kapasitas Maksimal per Kelas
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={capacityInput}
                            onChange={(e) => setCapacityInput(Number(e.target.value))}
                            className="w-full sm:w-36 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                            required
                        />
                    </div>

                    <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Awalan Nama Kelas
                        </label>
                        <input
                            type="text"
                            value={prefixInput}
                            onChange={(e) => setPrefixInput(e.target.value)}
                            placeholder="misal: Kelas Matsama"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isGenerating || totalAccepted === 0}
                        className="w-full sm:w-auto px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Memproses Pembagian...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">balance</span>
                                Bagi Kelas Otomatis (Komposisi Gender Seimbang)
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Unassigned Warning Banner */}
            {unassignedStudents.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                            Terdapat <strong>{unassignedStudents.length} murid diterima</strong> yang belum dimasukkan ke kelas orientasi mana pun.
                        </p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                        Re-Generate Pembagian
                    </button>
                </div>
            )}

            {/* Main Class List Content */}
            {classesData.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">groups</span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Belum Ada Kelas Orientasi Dibuat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Klik tombol <strong>"Bagi Kelas Otomatis"</strong> di atas untuk membuat pembagian kelas orientasi (Matsama) dengan komposisi jenis kelamin seimbang.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Class Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "all" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                        >
                            Semua Kelas ({classesData.length})
                        </button>
                        {classesData.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveTab(c.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === c.id ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                            >
                                <span>{c.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === c.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                                    {c.totalStudents}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Classes Grid */}
                    <div className="space-y-6">
                        {filteredClasses.map(c => (
                            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                {/* Class Header */}
                                <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                            {c.name.replace("Kelas Matsama ", "").substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{c.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Kapasitas: {c.totalStudents} / {c.capacity} murid
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gender Balance Badge */}
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            👨 Laki-laki: <strong>{c.maleCount}</strong>
                                        </span>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1">
                                            👩 Perempuan: <strong>{c.femaleCount}</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Table of Students */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="py-3 px-4 w-12 text-center">No</th>
                                                <th className="py-3 px-4">NISN</th>
                                                <th className="py-3 px-4">Nama Lengkap</th>
                                                <th className="py-3 px-4">Jenis Kelamin</th>
                                                <th className="py-3 px-4">Asal Sekolah</th>
                                                <th className="py-3 px-4">Jalur</th>
                                                <th className="py-3 px-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-200">
                                            {c.students.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-6 text-center text-slate-400">
                                                        Tidak ada siswa dalam kelas ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                c.students.map((s: any, idx: number) => {
                                                    const isMale = s.gender?.toUpperCase().startsWith("L");
                                                    return (
                                                        <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                                            <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                                                            <td className="py-3 px-4 font-mono font-medium">{s.nisn || "-"}</td>
                                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s.namaLengkap}</td>
                                                            <td className="py-3 px-4">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isMale ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"}`}>
                                                                    {isMale ? "👨 Laki-laki" : "👩 Perempuan"}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">{s.asalSekolah || "-"}</td>
                                                            <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">{s.jalur}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedStudentForMove(s);
                                                                        setTargetClassIdInput(c.id);
                                                                    }}
                                                                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors flex items-center gap-1 mx-auto"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                                                    Pindah Kelas
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Move Student */}
            {selectedStudentForMove && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">swap_horiz</span>
                                Pindahkan Siswa ke Kelas Lain
                            </h3>
                            <button
                                onClick={() => setSelectedStudentForMove(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleMoveStudent} className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-1">
                                <p className="text-slate-500">Nama Murid:</p>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedStudentForMove.namaLengkap}</p>
                                <p className="text-slate-500 text-[11px]">NISN: {selectedStudentForMove.nisn || "-"} | {selectedStudentForMove.gender?.toUpperCase().startsWith("L") ? "👨 Laki-laki" : "👩 Perempuan"}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Pilih Kelas Tujuan
                                </label>
                                <select
                                    value={targetClassIdInput}
                                    onChange={(e) => setTargetClassIdInput(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                    required
                                >
                                    {classesData.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.totalStudents} murid | 👨{c.maleCount} 👩{c.femaleCount})
                                        </option>
                                    ))}
                                    <option value="none">-- Lepas dari Kelas (Unassigned) --</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudentForMove(null)}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isMoving}
                                    className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isMoving ? "Memindahkan..." : "Simpan Perpindahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrientationClassesPage() {
    return (
        <Suspense fallback={
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] gap-3">
                <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
                <p className="text-sm font-medium text-slate-500">Memuat data kelas orientasi...</p>
            </div>
        }>
            <ClassesContent />
        </Suspense>
    );
}
