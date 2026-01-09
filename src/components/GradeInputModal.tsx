"use client";

import { useState, useEffect } from "react";
import { getGradeFormSetup, saveAllSemesterGrades } from "@/app/actions/grades";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface GradeInputModalProps {
    studentId: string;
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    isVerified?: boolean;
}


// Helper types for local state
type Subject = {
    id: string;
    name: string;
    category: string;
    order: number;
};

type Semester = {
    id: string;
    name: string;
    order: number;
};

type GradeState = Record<string, Record<string, number>>; // semesterId -> (subjectId -> score)

export default function GradeInputModal({ studentId, isOpen, onClose, initialData, isVerified = false }: GradeInputModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSetupLoading, setIsSetupLoading] = useState(true);

    // Dynamic Metadata
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // UI State
    const [activeSemesterId, setActiveSemesterId] = useState<string>("");
    const [schoolType, setSchoolType] = useState<'SD' | 'MI'>('SD');

    // Data State
    const [grades, setGrades] = useState<GradeState>({});

    // 1. Fetch Setup (Semesters & Subjects)
    useEffect(() => {
        if (isOpen) {
            const loadSetup = async () => {
                setIsSetupLoading(true);
                const { semesters: semList, subjects: subList } = await getGradeFormSetup();
                setSemesters(semList);
                setSubjects(subList);

                if (semList.length > 0) {
                    setActiveSemesterId(semList[0].id);

                    // Initialize empty state structure
                    const initialGrades: GradeState = {};
                    semList.forEach(s => {
                        initialGrades[s.id] = {};
                    });
                    setGrades(initialGrades);
                }

                setIsSetupLoading(false);
            };
            loadSetup();
        }
    }, [isOpen]);

    // 2. Load Initial Data (if editing existing)
    useEffect(() => {
        if (initialData && initialData.semesterGrades && semesters.length > 0) {
            const newGrades = { ...grades };

            // Map existing data to our state structure
            // We need to match relational data: SemesterGrade -> GradeEntry
            initialData.semesterGrades.forEach((sg: any) => {
                const semId = sg.semesterId;
                if (!newGrades[semId]) newGrades[semId] = {};

                // Assuming sg.entries is populated
                if (sg.entries) {
                    sg.entries.forEach((entry: any) => {
                        newGrades[semId][entry.subjectId] = entry.score;
                    });
                }
            });
            setGrades(newGrades);
        }
    }, [initialData, semesters]);

    const handleInputChange = (subjectId: string, value: string) => {
        let numValue = parseFloat(value);
        if (isNaN(numValue)) numValue = 0;
        if (numValue > 100) numValue = 100;

        setGrades(prev => ({
            ...prev,
            [activeSemesterId]: {
                ...prev[activeSemesterId],
                [subjectId]: numValue
            }
        }));
    };

    const getGradeValue = (subjectId: string) => {
        return grades[activeSemesterId]?.[subjectId] || "";
    };

    const calculateSemesterAverage = (semesterId: string) => {
        const currentGrades = grades[semesterId];
        if (!currentGrades || subjects.length === 0) return "0.00";

        // Only count subjects that have been input? Or all active subjects?
        // Usually average is Sum / Count of Active Subjects
        let total = 0;
        let count = 0;

        subjects.forEach(sub => {
            const val = currentGrades[sub.id];
            if (val !== undefined) {
                total += val;
                count++;
            }
        });

        if (count === 0) return "0.00";
        return (total / count).toFixed(2);
    };

    const handleSave = async () => {
        setLoading(true);

        // Filter subjects based on current school type
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

        // Validation: Ensure all visible subjects have values for all semesters
        for (const sem of semesters) {
            const currentGrades = grades[sem.id] || {};
            for (const sub of visibleSubjects) {
                const score = currentGrades[sub.id];
                if (score === undefined || score === null || score === 0) { // Assuming 0 is not a complete grade (usually > KKM)
                    // Allow 0 if explicitly typed? Maybe. But usually empty state is what we catch.
                    // My handleInputChange sets 0 for NaN. 
                    // Let's assume strictest validation: must be > 0.
                    // Or at least check if it exists. 
                    toast.error(`Nilai ${sub.name} di ${sem.name} belum diisi.`);
                    setActiveSemesterId(sem.id);
                    setTimeout(() => {
                        const el = document.getElementById('input-' + sub.id);
                        if (el) el.focus();
                    }, 100);
                    setLoading(false);
                    return;
                }
            }
        }

        const payload = semesters.map(sem => {
            const semesterGrades = grades[sem.id] || {};

            // Only save entries for visible subjects to avoid cluttering DB with hidden ones if user switched types
            // OR save everything user typed? Better to save only visible ones to ensure consistency with SchoolType.

            const entries = visibleSubjects.map(sub => ({
                subjectId: sub.id,
                score: semesterGrades[sub.id] || 0
            }));

            return {
                semesterId: sem.id,
                entries
            };
        });

        try {
            const result = await saveAllSemesterGrades(studentId, payload);

            if (result.success) {
                toast.success("Semua nilai berhasil disimpan");
                router.refresh();
                onClose();
            } else {
                toast.error(result.error || "Gagal menyimpan nilai");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1c2936] rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1c2936] sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Input Nilai Raport</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isVerified ? (
                                <span className="text-amber-600 font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">lock</span>
                                    Nilai terkunci karena sudah diverifikasi
                                </span>
                            ) : (
                                "Masukkan nilai sesuai mata pelajaran yang aktif"
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Tabs (Semesters) */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/30 p-2 border-b border-slate-100 dark:border-slate-800">
                    {semesters.map((sem) => {
                        const parts = sem.name.split(" ");
                        const classNum = parts[1] || "";
                        const semNum = parts[3] || "";

                        const isActive = activeSemesterId === sem.id;

                        return (
                            <button
                                key={sem.id}
                                onClick={() => setActiveSemesterId(sem.id)}
                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all relative overflow-hidden ${isActive
                                    ? "border-primary/50 bg-white dark:bg-slate-800 shadow-sm"
                                    : "border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                                    }`}
                            >
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-primary" : "text-slate-400"}`}>
                                    Smt {semNum}
                                </span>
                                <span className={`text-sm font-bold leading-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                                    KELAS {classNum}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* School Type Toggle (Compact) */}
                <div className="px-4 py-2 bg-white dark:bg-[#1c2936] border-b border-slate-100 dark:border-slate-800 flex flex-row items-center gap-3 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                        Jenjang:
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSchoolType('SD')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${schoolType === 'SD'
                                ? 'border-primary/50 bg-primary/5 text-primary'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">school</span>
                            <span className="text-sm font-bold">SD (Umum)</span>
                            {schoolType === 'SD' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>

                        <button
                            onClick={() => setSchoolType('MI')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${schoolType === 'MI'
                                ? 'border-primary/50 bg-primary/5 text-primary'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">mosque</span>
                            <span className="text-sm font-bold">MI (Agama)</span>
                            {schoolType === 'MI' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isSetupLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Render Subjects Grouped by Category */}
                            {['UMUM', 'AGAMA', 'MULOK'].map(category => {
                                // Filter Logic
                                const categorySubjects = subjects.filter(sub => {
                                    if (sub.category !== category) return false;

                                    if (category === 'AGAMA') {
                                        const isGeneralAgama = sub.name.toLowerCase().includes('pendidikan agama') || sub.name.toLowerCase() === 'agama';
                                        if (schoolType === 'SD') {
                                            return isGeneralAgama; // SD only shows general agama
                                        } else {
                                            return !isGeneralAgama; // MI shows specifics, hides general
                                        }
                                    }
                                    return true;
                                });

                                if (categorySubjects.length === 0) return null;

                                return (
                                    <div key={category}>
                                        <h3 className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            {category === 'AGAMA' ? 'Mata Pelajaran Agama' : category === 'MULOK' ? 'Muatan Lokal' : 'Mata Pelajaran Umum'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {categorySubjects.map(sub => (
                                                <InputGroup
                                                    key={sub.id}
                                                    id={`input-${sub.id}`}
                                                    label={sub.name}
                                                    value={getGradeValue(sub.id)}
                                                    onChange={(val) => handleInputChange(sub.id, val)}
                                                    disabled={isVerified}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg w-full sm:w-auto">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Rata-rata Semester Ini:</span>
                        <span className="text-lg font-bold text-primary">{calculateSemesterAverage(activeSemesterId)}</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex-1 sm:flex-none"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || isSetupLoading || isVerified}
                            className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 sm:flex-none"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">save</span>
                            )}
                            Simpan Nilai
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ id, label, value, onChange, disabled }: { id?: string, label: string, value: any, onChange: (val: string) => void, disabled?: boolean }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 truncate" title={label}>
                {label}
            </label>
            <input
                id={id}
                type="number"
                placeholder="0-100"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                disabled={disabled}
            />
        </div>
    );
}
