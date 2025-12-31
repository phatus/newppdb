"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AddStudentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get("studentId");
    const isEditMode = !!studentId;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        namaLengkap: "",
        nisn: "",
        gender: "",
        tempatLahir: "",
        tanggalLahir: "",
        asalSekolah: "",
        alamatLengkap: "",
        kota: "",
        kecamatan: ""
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
                    setFormData({
                        namaLengkap: data.namaLengkap || "",
                        nisn: data.nisn || "",
                        gender: data.gender || "",
                        tempatLahir: data.tempatLahir || "",
                        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir).toISOString().split('T')[0] : "",
                        asalSekolah: data.asalSekolah || "",
                        alamatLengkap: data.alamatLengkap || "",
                        kota: "", // Not stored separately
                        kecamatan: "" // Not stored separately
                    });
                })
                .catch((err) => {
                    setError("Gagal mengambil data siswa: " + err.message);
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }
    }, [studentId, isEditMode]);

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
                    gender: formData.gender,
                    tempatLahir: formData.tempatLahir,
                    tanggalLahir: formData.tanggalLahir,
                    asalSekolah: formData.asalSekolah,
                    alamatLengkap: formData.alamatLengkap,
                    kota: formData.kota,
                    kecamatan: formData.kecamatan
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Success, redirect
            router.push("/dashboard");
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
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
                        Data Siswa
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
                            {isEditMode ? "Formulir Edit Siswa" : "Formulir Tambah Siswa"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                            {isEditMode
                                ? "Silakan perbarui data siswa di bawah ini."
                                : "Silakan lengkapi data diri calon siswa di bawah ini. Pastikan semua informasi valid sebelum menyimpan."}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Main Form Card */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
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
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
                                    placeholder="10 digit nomor"
                                />
                            </div>
                            {/* Jenis Kelamin */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
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
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
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
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
                                    placeholder="Masukkan nama sekolah asal Anda"
                                />
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
                                <label
                                    htmlFor="alamat_lengkap"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    name="alamatLengkap"
                                    id="alamat_lengkap"
                                    rows={3}
                                    value={formData.alamatLengkap}
                                    onChange={handleChange}
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3 resize-none"
                                    placeholder="Nama Jalan, No. Rumah, RT/RW"
                                ></textarea>
                            </div>
                            <div className="col-span-1">
                                <label
                                    htmlFor="kota"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Kabupaten / Kota
                                </label>
                                <input
                                    type="text"
                                    name="kota"
                                    id="kota"
                                    value={formData.kota}
                                    onChange={handleChange}
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
                                    placeholder="Contoh: Pacitan"
                                />
                            </div>
                            <div className="col-span-1">
                                <label
                                    htmlFor="kecamatan"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                                >
                                    Kecamatan
                                </label>
                                <input
                                    type="text"
                                    name="kecamatan"
                                    id="kecamatan"
                                    value={formData.kecamatan}
                                    onChange={handleChange}
                                    className="form-input w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring focus:ring-primary/20 sm:text-sm py-2.5 px-3"
                                    placeholder="Contoh: Arjosari"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-5 md:px-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                        {!isEditMode && (
                            <label className="inline-flex items-center cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="rounded border-slate-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                                    Tambah siswa lain setelah menyimpan
                                </span>
                            </label>
                        )}
                        <div className={`flex items-center gap-3 w-full md:w-auto ${isEditMode ? 'ml-auto' : ''}`}>
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
                                        {isEditMode ? "Simpan Perubahan" : "Simpan Data"}
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
