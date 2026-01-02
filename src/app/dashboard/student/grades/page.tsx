"use client";

import { useState, useEffect, Suspense } from "react";
import { getGradeFormSetup, saveAllSemesterGrades } from "@/app/actions/grades";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface GradeInputPageProps {
    searchParams: any;
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

function GradeInputForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get("studentId");

    // Fallback if no student ID
    if (!studentId) {
        if (typeof window !== "undefined") {
            router.push("/dashboard");
        }
        return null;
    }

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

    // 1. Fetch Setup (Semesters & Subjects) & Existing Data
    useEffect(() => {
        const loadSetup = async () => {
            setIsSetupLoading(true);
            try {
                // Parallel fetch: Setup + Student's existing grades
                const [setupData, studentRes] = await Promise.all([
                    getGradeFormSetup(),
                    fetch(`/api/students/${studentId}`).then(res => res.json())
                ]);

                const { semesters: semList, subjects: subList } = setupData;
                setSemesters(semList);
                setSubjects(subList);

                if (semList.length > 0) {
                    setActiveSemesterId(semList[0].id);

                    // Initialize empty state structure
                    const initialGrades: GradeState = {};
                    semList.forEach((s: Semester) => {
                        initialGrades[s.id] = {};
                    });

                    // Load existing grades if any
                    const existingGrades = studentRes.grades;
                    if (existingGrades && existingGrades.semesterGrades) {
                        existingGrades.semesterGrades.forEach((sg: any) => {
                            const semId = sg.semesterId;
                            if (sg.entries) {
                                if (!initialGrades[semId]) initialGrades[semId] = {};
                                sg.entries.forEach((entry: any) => {
                                    initialGrades[semId][entry.subjectId] = entry.score;
                                });
                            }
                        });
                    }

                    setGrades(initialGrades);
                }
            } catch (error) {
                console.error("Failed to load grade setup", error);
                toast.error("Gagal memuat data");
            } finally {
                setIsSetupLoading(false);
            }
        };

        if (studentId) {
            loadSetup();
        }
    }, [studentId]);

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

        let total = 0;
        let count = 0;

        subjects.forEach(sub => {
            // Basic visibility check for average calculation (same as save logic)
            let isVisible = true;
            if (sub.category === 'AGAMA') {
                const isGeneralAgama = sub.name.toLowerCase().includes('pendidikan agama') || sub.name.toLowerCase() === 'agama';
                if (schoolType === 'SD') isVisible = isGeneralAgama;
                else isVisible = !isGeneralAgama;
            }

            if (isVisible) {
                const val = currentGrades[sub.id];
                if (val !== undefined) {
                    total += val;
                    count++;
                }
            }
        });

        if (count === 0) return "0.00";
        return (total / count).toFixed(2);
    };

    const handleSave = async () => {
        if (!studentId) return;
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
                // Check strict missing value. 0 is allowed but empty/undefined is not.
                // In our logic getGradeValue returns "" if undefined. 
                // But state usually initializes with 0 or user inputs number.
                // Let's assume validation passes if it's not undefined.
                // Actually, let's enforce > 0 or explicit 0 if we really want.
                // Ideally user must fill it.
                if (score === undefined) {
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
                toast.success("Data berhasil disimpan!");
                router.push("/dashboard"); // Finish Wizard
                router.refresh();
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

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-5xl mx-auto w-full space-y-6">

                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Input Nilai Raport
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                        Lengkapi nilai raport dari Kelas 4 Semester 1 hingga Kelas 6 Semester 1.
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1c2936] rounded-2xl w-full shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">

                    {/* Header Controls */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-[#1c2936]">
                        {/* School Type Toggle */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                                Jenjang Asal:
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
                    </div>

                    {/* Tabs (Semesters) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/30 p-4 border-b border-slate-100 dark:border-slate-800">
                        {semesters.map((sem) => {
                            const parts = sem.name.split(" ");
                            const classNum = parts[1] || "";
                            const semNum = parts[3] || "";

                            const isActive = activeSemesterId === sem.id;

                            return (
                                <button
                                    key={sem.id}
                                    onClick={() => setActiveSemesterId(sem.id)}
                                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all relative overflow-hidden ${isActive
                                        ? "border-primary/50 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-primary/20"
                                        : "border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                                        }`}
                                >
                                    <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isActive ? "text-primary" : "text-slate-400"}`}>
                                        Smt {semNum}
                                    </span>
                                    <span className={`text-sm md:text-base font-black leading-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                                        KELAS {classNum}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {isSetupLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                                    <p className="text-slate-500 text-sm font-medium">Memuat data nilai...</p>
                                </div>
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
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    {category === 'AGAMA' ? 'Mata Pelajaran Agama' : category === 'MULOK' ? 'Muatan Lokal' : 'Mata Pelajaran Umum'}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                                {categorySubjects.map(sub => (
                                                    <InputGroup
                                                        key={sub.id}
                                                        id={`input-${sub.id}`}
                                                        label={sub.name}
                                                        value={getGradeValue(sub.id)}
                                                        onChange={(val) => handleInputChange(sub.id, val)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer Stats & Actions */}
                    <div className="sticky bottom-0 p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4 z-10">
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-auto">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">analytics</span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rata-rata Semester Ini</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">{calculateSemesterAverage(activeSemesterId)}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Link href={`/dashboard/student/documents?studentId=${studentId}`} className="flex-1 md:flex-none">
                                <button
                                    className="w-full px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Kembali
                                </button>
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={loading || isSetupLoading}
                                className="w-full md:w-auto flex-1 md:flex-none px-8 py-3 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                )}
                                Simpan & Selesai
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ id, label, value, onChange }: { id?: string, label: string, value: any, onChange: (val: string) => void }) {
    return (
        <div className="group">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate group-focus-within:text-primary transition-colors" title={label}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-bold">
                    /100
                </div>
            </div>
        </div>
    );
}

export default function GradeInputPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GradeInputForm />
        </Suspense>
    );
}
