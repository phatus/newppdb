"use client";

import { Student } from "@prisma/client";

interface StepperProps {
    student: any; // Using any for flexibility with included relations
}

export default function RegistrationStepper({ student }: StepperProps) {
    // 1. Check Document Completeness
    const docs = student.documents;
    const requiredDocs = ['fileKK', 'fileAkta', 'fileRaport', 'pasFoto'];
    const docsComplete = docs && requiredDocs.every(key => docs[key]);

    // 2. Check Grade Completeness (Assuming 4 semesters required for SD/MI -> SMP)
    const gradeCount = student.grades?.semesterGrades?.length || 0;
    const gradesComplete = gradeCount >= 3;

    // 3. Determine Current Step
    // Steps: 0:Daftar, 1:Docs, 2:Grades, 3:Verification, 4:Done/Card
    let currentStep = 0;

    if (docsComplete) currentStep = 1;
    if (docsComplete && gradesComplete) currentStep = 2; // Ready for verification
    if (docsComplete && gradesComplete && student.statusVerifikasi !== 'PENDING' && student.statusVerifikasi !== 'NEW') currentStep = 3;
    if (student.statusVerifikasi === 'VERIFIED') currentStep = 4;

    const steps = [
        { label: "Data Diri", icon: "person" },
        { label: "Dokumen", icon: "description" },
        { label: "Nilai Rapor", icon: "school" },
        { label: "Verifikasi", icon: "hourglass_top" },
        { label: "Kartu Ujian", icon: "badge" },
    ];

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-0"></div>
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    // Specific check for Verifikasi step to show Warning/Error if Rejected
                    const isRejected = index === 3 && student.statusVerifikasi === 'REJECTED';

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 z-10">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                                    ${isRejected
                                        ? 'bg-red-500 border-red-200 text-white'
                                        : isCompleted
                                            ? 'bg-primary border-blue-100 dark:border-blue-900 text-white shadow-lg scale-110'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400'
                                    }
                                `}
                            >
                                <span className="material-symbols-outlined text-sm md:text-base">
                                    {isRejected ? 'close' : (isCompleted && index < currentStep ? 'check' : step.icon)}
                                </span>
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold text-center absolute -bottom-6 w-20
                                ${isCurrent ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Legend/Info Text for Current Step */}
            <div className="mt-8 text-center">
                {currentStep === 0 && <p className="text-sm text-slate-500">Lengkapi dokumen persyaratan Anda.</p>}
                {currentStep === 1 && !gradesComplete && <p className="text-sm text-amber-600 font-medium">Dokumen lengkap! Segera input nilai rapor semester 7-11/kelas 4-6.</p>}
                {currentStep === 2 && student.statusVerifikasi === 'PENDING' && <p className="text-sm text-blue-600 font-medium">Data lengkap. Menunggu verifikasi admin.</p>}
                {currentStep === 3 && student.statusVerifikasi === 'VERIFIED' && <p className="text-sm text-green-600 font-bold">Selamat! Data terverifikasi.</p>}
                {student.statusVerifikasi === 'REJECTED' && <p className="text-sm text-red-600 font-bold">Data ditolak. Cek pesan perbaikan.</p>}
            </div>
        </div>
    );
}
