"use client";

import { useState } from "react";
import { adminSaveAllGrades } from "@/app/actions/grades";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface EditableGradeTableProps {
    studentId: string;
    subjects: any[];
    semesters: any[];
    initialGradesMap: Record<string, Record<string, number>>;
    semesterAverageMap: Record<string, number>;
    totalAverage: number;
    fileRaport?: string | null;
    jenjang?: string | null;
}

export default function EditableGradeTable({
    studentId,
    subjects,
    semesters,
    initialGradesMap,
    semesterAverageMap,
    totalAverage,
    fileRaport,
    jenjang
}: EditableGradeTableProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState<Record<string, Record<string, number>>>(initialGradesMap);
    const [schoolType, setSchoolType] = useState<'SD' | 'MI'>((jenjang as 'SD' | 'MI') || 'SD');

    const visibleSubjects = subjects.filter(sub => {
        if (sub.category === 'AGAMA') {
            const isGeneralAgama = sub.name.toLowerCase().includes('pendidikan agama') || sub.name.toLowerCase() === 'agama';
            if (schoolType === 'SD') {
                return isGeneralAgama;
            } else {
                return !isGeneralAgama;
            }
        }
        return true;
    });

    const handleScoreChange = (semesterId: string, subjectId: string, value: string) => {
        const score = parseFloat(value) || 0;
        setGrades(prev => ({
            ...prev,
            [semesterId]: {
                ...(prev[semesterId] || {}),
                [subjectId]: score
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = semesters.map(sem => ({
                semesterId: sem.id,
                entries: visibleSubjects.map(subj => ({
                    subjectId: subj.id,
                    score: grades[sem.id]?.[subj.id] || 0
                }))
            }));

            const res = await adminSaveAllGrades(studentId, payload);
            if (res.success) {
                toast.success("Nilai berhasil diperbarui");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(res.error || "Gagal memperbarui nilai");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic averages based on current state
    const currentSemesterAverages: Record<string, number> = {};
    semesters.forEach(sem => {
        let sum = 0;
        let count = 0;
        visibleSubjects.forEach(subj => {
            const score = grades[sem.id]?.[subj.id];
            if (score !== undefined && score !== null) {
                sum += score;
                count++;
            }
        });
        currentSemesterAverages[sem.id] = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
    });

    const currentTotalAverage = semesters.length > 0
        ? parseFloat((Object.values(currentSemesterAverages).reduce((a, b) => a + b, 0) / semesters.length).toFixed(2))
        : 0;

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600">analytics</span>
                    Verifikasi Nilai Raport
                </h3>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-700 p-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                    <button
                        onClick={() => { if (isEditing) setSchoolType('SD'); }}
                        disabled={!isEditing}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${schoolType === 'SD'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        SD (Umum)
                    </button>
                    <button
                        onClick={() => { if (isEditing) setSchoolType('MI'); }}
                        disabled={!isEditing}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${schoolType === 'MI'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">mosque</span>
                        MI (Agama)
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500">
                        Total Rata-Rata: <span className="font-bold text-slate-900 dark:text-white">{currentTotalAverage.toFixed(2)}</span>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-primary hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Edit Nilai
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setGrades(initialGradesMap);
                                    setIsEditing(false);
                                }}
                                disabled={loading}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                )}
                                Simpan Perubahan
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-0 grid grid-cols-1 xl:grid-cols-2 h-[600px] divide-y xl:divide-y-0 xl:divide-x divide-slate-200 dark:divide-slate-700">
                {/* Left: PDF Viewer */}
                <div className="relative h-[600px] w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    {fileRaport ? (
                        <iframe
                            src={`${fileRaport}#toolbar=0`}
                            className="w-full h-full"
                            title="Raport PDF"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">picture_as_pdf</span>
                            <p className="text-slate-500">Dokumen Raport (PDF) belum diunggah.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 overflow-auto h-full">
                    <p className="text-sm text-slate-500 mb-4 px-1">
                        {isEditing
                            ? "Mode Edit Aktif: Silakan ubah nilai sesuai dengan dokumen raport."
                            : "Cocokkan nilai yang diinput di bawah ini dengan dokumen di samping."}
                    </p>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-inner bg-white dark:bg-slate-900/50">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th className="px-4 py-3 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Mata Pelajaran</th>
                                    {semesters.map((sem: any) => (
                                        <th key={sem.id} className="px-4 py-3 text-center whitespace-nowrap min-w-[100px]">
                                            {sem.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {visibleSubjects.map((subj: any) => (
                                    <tr key={subj.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <th className="px-4 py-2 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 truncate max-w-[150px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]" title={subj.name}>
                                            {subj.name}
                                        </th>
                                        {semesters.map((sem: any) => {
                                            const score = grades[sem.id]?.[subj.id];
                                            return (
                                                <td key={sem.id} className="px-4 py-2 text-center">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={score ?? ""}
                                                            onChange={(e) => handleScoreChange(sem.id, subj.id, e.target.value)}
                                                            className="w-full min-w-[60px] text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    ) : (
                                                        <span className={score !== undefined ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-300 dark:text-slate-600'}>
                                                            {score !== undefined ? score : "-"}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}

                                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                                    <td className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Rata-Rata</td>
                                    {semesters.map((sem: any) => (
                                        <td key={sem.id} className="px-4 py-3 text-center text-primary font-bold">
                                            {currentSemesterAverages[sem.id]?.toFixed(2) || "-"}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
