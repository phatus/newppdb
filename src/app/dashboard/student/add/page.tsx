"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActiveWave } from "@/app/actions/waves";
import toast from "react-hot-toast";

function AddStudentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get("studentId");
    const isEditMode = !!studentId;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState("");
    const [activeWave, setActiveWave] = useState<any>(null);
    const [waveLoading, setWaveLoading] = useState(true);
    const [formData, setFormData] = useState({
        namaLengkap: "",
        nisn: "",
        nik: "", // New
        noKk: "", // New
        gender: "",
        tempatLahir: "",
        tanggalLahir: "",
        asalSekolah: "",

        // Parent Data
        namaAyah: "",
        pekerjaanAyah: "",
        namaIbu: "",
        pekerjaanIbu: "",
        penghasilanOrtu: "",

        // Address Data
        alamatJalan: "",
        alamatRt: "",
        alamatRw: "",
        alamatDesa: "",
        alamatKecamatan: "",
        alamatKabupaten: "",
        alamatProvinsi: "",
        kodePos: "",

        jalur: "REGULER",
        catatanPenolakan: "",
        telepon: "",
    });

    useEffect(() => {
        if (isEditMode) {
            setIsFetching(true);
            fetch(`/api/students/${studentId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch student");
                    return res.json();
                })
                .then((data) => {
                    const addressParts = (data.alamatLengkap || "").split(", ");
                    let loadedAlamat = data.alamatLengkap || "";
                    let loadedKecamatan = "";
                    let loadedKota = "";

                    // Attempt to parse standard format: "Address, Kecamatan, Kota"
                    if (addressParts.length >= 3) {
                        loadedKota = addressParts[addressParts.length - 1];
                        loadedKecamatan = addressParts[addressParts.length - 2];
                        // Re-join the rest as the street address
                        loadedAlamat = addressParts.slice(0, addressParts.length - 2).join(", ");
                    }

                    setFormData({
                        namaLengkap: data.namaLengkap || "",
                        nisn: data.nisn || "",
                        nik: data.nik || "",
                        noKk: data.noKk || "",
                        gender: data.gender || "",
                        tempatLahir: data.tempatLahir || "",
                        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir).toISOString().split('T')[0] : "",
                        asalSekolah: data.asalSekolah || "",

                        // Parents
                        namaAyah: data.namaAyah || "",
                        pekerjaanAyah: data.pekerjaanAyah || "",
                        namaIbu: data.namaIbu || "",
                        pekerjaanIbu: data.pekerjaanIbu || "",
                        penghasilanOrtu: data.penghasilanOrtu || "",

                        // Address
                        alamatJalan: data.alamatJalan || "",
                        alamatRt: data.alamatRt || "",
                        alamatRw: data.alamatRw || "",
                        alamatDesa: data.alamatDesa || "",
                        alamatKecamatan: data.alamatKecamatan || "",
                        alamatKabupaten: data.alamatKabupaten || "",
                        alamatProvinsi: data.alamatProvinsi || "",
                        kodePos: data.kodePos || "",

                        jalur: data.jalur || "REGULER",
                        catatanPenolakan: data.catatanPenolakan || "",
                        telepon: data.telepon || "",
                    });
                })
                .catch((err) => {
                    setError("Gagal mengambil data murid: " + err.message);
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }
    }, [studentId, isEditMode]);

    useEffect(() => {
        getActiveWave().then((wave) => {
            setActiveWave(wave);
            setWaveLoading(false);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const url = isEditMode ? `/api/students/${studentId}` : "/api/students";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    namaLengkap: formData.namaLengkap,
                    nisn: formData.nisn,
                    nik: formData.nik,
                    noKk: formData.noKk,
                    gender: formData.gender,
                    tempatLahir: formData.tempatLahir,
                    tanggalLahir: formData.tanggalLahir,
                    asalSekolah: formData.asalSekolah,

                    namaAyah: formData.namaAyah,
                    pekerjaanAyah: formData.pekerjaanAyah,
                    namaIbu: formData.namaIbu,
                    pekerjaanIbu: formData.pekerjaanIbu,
                    penghasilanOrtu: formData.penghasilanOrtu,

                    alamatJalan: formData.alamatJalan,
                    alamatRt: formData.alamatRt,
                    alamatRw: formData.alamatRw,
                    alamatDesa: formData.alamatDesa,
                    alamatKecamatan: formData.alamatKecamatan,
                    alamatKabupaten: formData.alamatKabupaten,
                    alamatProvinsi: formData.alamatProvinsi,
                    kodePos: formData.kodePos,

                    jalur: formData.jalur,
                    telepon: formData.telepon,
                    waveId: activeWave?.id // Include active wave ID
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Success, redirect
            // Success, redirect to documents
            if (data.student && data.student.id) {
                router.push(`/dashboard/student/documents?studentId=${data.student.id}`);
            } else {
                router.push("/dashboard");
            }
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching || waveLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // If no active wave and not editing, show closed message
    if (!activeWave && !isEditMode) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <span className="material-symbols-outlined text-4xl">event_busy</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Pendaftaran Ditutup</h2>
                <p className="text-slate-600">
                    Saat ini tidak ada gelombang pendaftaran yang aktif. Silakan hubungi panitia untuk informasi lebih lanjut.
                </p>
                <button onClick={() => router.push("/dashboard")} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold">
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-4xl mx-auto space-y-6 w-full">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <a href="/dashboard" className="hover:text-primary transition-colors">
                        Home
                    </a>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                    <a href="#" className="hover:text-primary transition-colors">
                        Data Murid
                    </a>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                        {isEditMode ? "Edit" : "Tambah"}
                    </span>
                </nav>
                {/* Page Heading */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            {isEditMode ? "Formulir Edit Murid" : "Formulir Tambah Murid"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                            {isEditMode
                                ? "Silakan perbarui data murid di bawah ini."
                                : "Silakan lengkapi data diri calon murid di bawah ini. Pastikan semua informasi valid sebelum menyimpan."}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Rejection Alert */}
                {isEditMode && formData.catatanPenolakan && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col md:flex-row items-start gap-4 animate-in slide-in-from-top-2">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full flex-shrink-0 text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined text-2xl">
                                report_problem
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-1">
                                Pendaftaran Perlu Perbaikan
                            </h3>
                            <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                                Admin telah meninjau data Anda dan memberikan catatan perbaikan berikut:
                            </p>
                            <div className="mt-3 p-4 bg-white dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/50">
                                <p className="font-medium text-red-800 dark:text-red-200 text-sm">
                                    "{formData.catatanPenolakan}"
                                </p>
                            </div>
                            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                                Silakan perbaiki data sesuai catatan di atas dan simpan kembali formulir ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Form Card */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Section 0: Jalur Pendaftaran (Centered & Top) */}
                    <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                        <div className="text-center max-w-2xl mx-auto space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Pilih Jalur Pendaftaran
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Tentukan jalur yang sesuai dengan kualifikasi Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {[
                                {
                                    id: "REGULER",
                                    label: "Reguler",
                                    desc: "Pendaftaran umum.",
                                    icon: "home_pin",
                                    color: "blue"
                                },
                                {
                                    id: "PRESTASI_AKADEMIK",
                                    label: "Prestasi Akademik",
                                    desc: "Menggunakan nilai rapor dan sertifikat akademik.",
                                    icon: "school",
                                    color: "amber"
                                },
                                {
                                    id: "PRESTASI_NON_AKADEMIK",
                                    label: "Prestasi Non-Akademik",
                                    desc: "Menggunakan sertifikat kejuaraan olahraga/seni.",
                                    icon: "emoji_events",
                                    color: "emerald"
                                },
                                {
                                    id: "AFIRMASI",
                                    label: "Afirmasi",
                                    desc: "Untuk murid dari keluarga kurang mampu (SKTM).",
                                    icon: "volunteer_activism",
                                    color: "purple"
                                }
                            ].filter(opt =>
                                // If editing, allow currently selected option even if not available in active wave (so checking current status works)
                                // But prevent selecting NEW options that are not in active wave
                                (!activeWave?.jalurAllowed || activeWave.jalurAllowed.includes(opt.id)) ||
                                (isEditMode && formData.jalur === opt.id)
                            ).map((option) => {
                                const isSelected = formData.jalur === option.id;
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => setFormData(prev => ({ ...prev, jalur: option.id }))}
                                        className={`
                                            cursor-pointer relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-200 text-left
                                            ${isSelected
                                                ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20 shadow-md transform scale-[1.02]`
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className={`
                                                    w-12 h-12 rounded-xl flex items-center justify-center
                                                    ${isSelected
                                                        ? `bg-${option.color}-100 text-${option.color}-600 dark:bg-${option.color}-900/40 dark:text-${option.color}-400`
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                    }
                                                `}>
                                                    <span className="material-symbols-outlined text-[24px]">
                                                        {option.icon}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className={`text-${option.color}-500`}>
                                                        <span className="material-symbols-outlined text-[24px]">
                                                            check_circle
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className={`font-bold text-base mb-1 ${isSelected ? `text-${option.color}-700 dark:text-${option.color}-300` : 'text-slate-900 dark:text-white'}`}>
                                                    {option.label}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {option.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <input type="hidden" name="jalur" value={formData.jalur} />
                    </div>

                    {/* Section 1: Data Pribadi */}
                    <div className="p-6 md:p-8 space-y-8">
                        <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    person
                                </span>
                                Data Pribadi
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Lengkap */}
                            <div className="col-span-1 md:col-span-2">
                                <label
                                    htmlFor="nama_lengkap"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="namaLengkap"
                                    id="nama_lengkap"
                                    required
                                    value={formData.namaLengkap}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-0 sm:text-sm py-2.5 px-4 transition-all placeholder:text-slate-400"
                                    placeholder="Contoh: Ahmad Fauzi"
                                />
                            </div>
                            {/* NISN */}
                            <div className="col-span-1">
                                <label
                                    htmlFor="nisn"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    NISN
                                </label>
                                <input
                                    type="number"
                                    name="nisn"
                                    id="nisn"
                                    required
                                    value={formData.nisn}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-0 sm:text-sm py-2.5 px-4 transition-all placeholder:text-slate-400"
                                    placeholder="10 digit nomor"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">NIK</label>
                                <input type="number" name="nik" required value={formData.nik} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="16 digit NIK" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">No. KK</label>
                                <input type="number" name="noKk" value={formData.noKk} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="16 digit KK" />
                            </div>


                            <div className="flex flex-col gap-2">
                                <label htmlFor="gender" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Jenis Kelamin
                                </label>
                                <div className="flex gap-4 h-[42px] items-center">
                                    <div className="flex items-center">
                                        <input
                                            id="gender_male"
                                            name="gender"
                                            type="radio"
                                            value="Laki-laki"
                                            checked={formData.gender === "Laki-laki"}
                                            onChange={handleChange}
                                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <label
                                            htmlFor="gender_male"
                                            className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                                        >
                                            Laki-laki
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="gender_female"
                                            name="gender"
                                            type="radio"
                                            value="Perempuan"
                                            checked={formData.gender === "Perempuan"}
                                            onChange={handleChange}
                                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <label
                                            htmlFor="gender_female"
                                            className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                                        >
                                            Perempuan
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {/* Tempat Lahir */}
                            <div className="col-span-1">
                                <label
                                    htmlFor="tempat_lahir"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Tempat Lahir
                                </label>
                                <input
                                    type="text"
                                    name="tempatLahir"
                                    id="tempat_lahir"
                                    value={formData.tempatLahir}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-0 sm:text-sm py-2.5 px-4 transition-all placeholder:text-slate-400"
                                    placeholder="Kota kelahiran"
                                />
                            </div>
                            {/* Tanggal Lahir */}
                            <div className="col-span-1">
                                <label
                                    htmlFor="tanggal_lahir"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    name="tanggalLahir"
                                    id="tanggal_lahir"
                                    value={formData.tanggalLahir}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-0 sm:text-sm py-2.5 px-4 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Section 2: Data Akademik */}
                    <div className="p-6 md:p-8 space-y-8 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="pb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    school
                                </span>
                                Data Akademik
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label
                                    htmlFor="asal_sekolah"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Asal Sekolah (SD/MI)
                                </label>
                                <input
                                    type="text"
                                    name="asalSekolah"
                                    id="asal_sekolah"
                                    value={formData.asalSekolah}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-0 sm:text-sm py-2.5 px-4 transition-all placeholder:text-slate-400"
                                    placeholder="Masukkan nama sekolah asal Anda"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Section: Data Orang Tua */}
                    <div className="p-6 md:p-8 space-y-8 border-t border-slate-200 dark:border-slate-700">
                        <div className="pb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">family_restroom</span>
                                Data Orang Tua
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ayah */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Data Ayah</h4>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Ayah</label>
                                    <input type="text" name="namaAyah" value={formData.namaAyah} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Lengkap Ayah" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pekerjaan Ayah</label>
                                    <input type="text" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Pekerjaan Ayah" />
                                </div>
                            </div>
                            {/* Ibu */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Data Ibu</h4>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Ibu</label>
                                    <input type="text" name="namaIbu" value={formData.namaIbu} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Lengkap Ibu" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pekerjaan Ibu</label>
                                    <input type="text" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Pekerjaan Ibu" />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Penghasilan Orang Tua (Gabungan)</label>
                                <select name="penghasilanOrtu" value={formData.penghasilanOrtu} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all">
                                    <option value="">Pilih Penghasilan</option>
                                    <option value="< 1 Juta">Kurang dari 1 Juta</option>
                                    <option value="1 - 3 Juta">1 - 3 Juta</option>
                                    <option value="3 - 5 Juta">3 - 5 Juta</option>
                                    <option value="> 5 Juta">Lebih dari 5 Juta</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Section 3: Data Alamat */}
                    <div className="p-6 md:p-8 space-y-8 border-t border-slate-200 dark:border-slate-700">
                        <div className="pb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    home_pin
                                </span>
                                Data Alamat
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Jalan / Dusun</label>
                                <input type="text" name="alamatJalan" value={formData.alamatJalan} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Jalan / Dusun" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">RT</label>
                                    <input type="text" name="alamatRt" value={formData.alamatRt} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">RW</label>
                                    <input type="text" name="alamatRw" value={formData.alamatRw} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="001" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Desa / Kelurahan</label>
                                <input type="text" name="alamatDesa" value={formData.alamatDesa} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Desa" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kecamatan</label>
                                <input type="text" name="alamatKecamatan" value={formData.alamatKecamatan} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Kecamatan" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kabupaten / Kota</label>
                                <input type="text" name="alamatKabupaten" value={formData.alamatKabupaten} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Kabupaten" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Provinsi</label>
                                <input type="text" name="alamatProvinsi" value={formData.alamatProvinsi} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Nama Provinsi" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kode Pos</label>
                                <input type="text" name="kodePos" value={formData.kodePos} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 px-4 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400" placeholder="Kode Pos" />
                            </div>
                            {/* Telepon */}
                            <div className="col-span-1">
                                <label
                                    htmlFor="telepon"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Nomor Telepon / WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    name="telepon"
                                    id="telepon"
                                    value={formData.telepon}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-0 sm:text-sm py-2.5 px-4 transition-all placeholder:text-slate-400"
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-5 md:px-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-end gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full md:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-md shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        {isEditMode ? "Menyimpan Perubahan..." : "Menyimpan..."}
                                    </span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">
                                            save
                                        </span>
                                        {isEditMode ? "Simpan Perubahan" : "Simpan & Lanjut"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AddStudentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddStudentForm />
        </Suspense>
    );
}
