"use client";

import { useState } from "react";
import { updateStudentBio } from "@/app/actions/students";
import { toast } from "react-hot-toast";
import ContactWAButton from "./ContactWAButton";
import { getFileUrl } from "@/lib/utils";

interface BioDataEditorProps {
    student: any;
}

export default function BioDataEditor({ student }: BioDataEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        namaLengkap: student.namaLengkap || "",
        nisn: student.nisn || "",
        nik: student.nik || "",
        noKk: student.noKk || "",
        gender: student.gender || "",
        tempatLahir: student.tempatLahir || "",
        tanggalLahir: student.tanggalLahir ? new Date(student.tanggalLahir).toISOString().split('T')[0] : "",
        jenjang: student.jenjang || "SD",
        asalSekolah: student.asalSekolah || "",
        alamatJalan: student.alamatJalan || "",
        alamatRt: student.alamatRt || "",
        alamatRw: student.alamatRw || "",
        alamatDesa: student.alamatDesa || "",
        alamatKecamatan: student.alamatKecamatan || "",
        alamatKabupaten: student.alamatKabupaten || "",
        alamatProvinsi: student.alamatProvinsi || "",
        kodePos: student.kodePos || "",
        telepon: student.telepon || "",
        jalur: student.jalur || "REGULER",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await updateStudentBio(student.id, formData);
            if (res.success) {
                toast.success("Data berhasil diperbarui");
                setIsEditing(false);
            } else {
                toast.error(res.error || "Gagal memperbarui data");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Data Murid
                    </h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-bold transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit Data
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 overflow-hidden shadow-inner">
                            {student.documents?.pasFoto ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={getFileUrl(student.documents.pasFoto)} alt="Pas Foto" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">{student.namaLengkap}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded uppercase tracking-wider">
                                NISN: {student.nisn}
                            </span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded uppercase tracking-wider">
                                {student.jalur?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <dl className="grid grid-cols-1 gap-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">NIK</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{student.nik || '-'}</dd>
                        </div>
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">No. Kartu Keluarga</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{student.noKk || '-'}</dd>
                        </div>
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Tempat, Tanggal Lahir</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                                {student.tempatLahir}, {student.tanggalLahir ? new Date(student.tanggalLahir).toLocaleDateString('id-ID') : '-'}
                            </dd>
                        </div>
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Asal Sekolah</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-bold mb-1">
                                    {student.jenjang}
                                </span>
                                <br />
                                {student.asalSekolah || '-'}
                            </dd>
                        </div>
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Alamat Lengkap</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                                {student.alamatJalan} {student.alamatRt && `RT.${student.alamatRt}`} {student.alamatRw && `RW.${student.alamatRw}`}, {student.alamatDesa}, {student.alamatKecamatan}, {student.alamatKabupaten}, {student.alamatProvinsi} {student.kodePos}
                            </dd>
                        </div>
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Data Orang Tua</dt>
                            <dd className="mt-1 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Ayah:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{student.namaAyah || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Ibu:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{student.namaIbu || '-'}</span>
                                </div>
                            </dd>
                        </div>
                        <div className="flex items-center justify-between group">
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Nomor Telepon</dt>
                                <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {student.telepon || '-'}
                                </dd>
                            </div>
                            {student.telepon && (
                                <ContactWAButton
                                    studentId={student.id}
                                    studentName={student.namaLengkap}
                                    phoneNumber={student.telepon}
                                />
                            )}
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-tight">Email Akun</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white break-all opacity-75">{student.user?.email || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border-2 border-primary ring-4 ring-primary/5 overflow-hidden transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Edit Biodata Murid
                </h3>
                <button
                    onClick={() => setIsEditing(false)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="space-y-4 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">Informasi Dasar</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                                <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NISN</label>
                                <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NIK</label>
                                <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. KK</label>
                                <input type="text" name="noKk" value={formData.noKk} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tempat Lahir</label>
                                <input type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                                <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="">Pilih</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telepon/WA</label>
                                <input type="text" name="telepon" value={formData.telepon} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* School Info */}
                    <div className="space-y-4 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">Data Sekolah & Jalur</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jenjang</label>
                                <select name="jenjang" value={formData.jenjang} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="SD">SD</option>
                                    <option value="MI">MI</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Asal Sekolah</label>
                                <input type="text" name="asalSekolah" value={formData.asalSekolah} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jalur Pendaftaran</label>
                                <select name="jalur" value={formData.jalur} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="REGULER">Reguler</option>
                                    <option value="PRESTASI_AKADEMIK">Prestasi Akademik</option>
                                    <option value="PRESTASI_NON_AKADEMIK">Prestasi Non-Akademik</option>
                                    <option value="AFIRMASI">Afirmasi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="space-y-4 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">Alamat Domisili</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jalan / Dusun</label>
                                <input type="text" name="alamatJalan" value={formData.alamatJalan} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">RT</label>
                                <input type="text" name="alamatRt" value={formData.alamatRt} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">RW</label>
                                <input type="text" name="alamatRw" value={formData.alamatRw} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Desa</label>
                                <input type="text" name="alamatDesa" value={formData.alamatDesa} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kecamatan</label>
                                <input type="text" name="alamatKecamatan" value={formData.alamatKecamatan} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kabupaten</label>
                                <input type="text" name="alamatKabupaten" value={formData.alamatKabupaten} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
                                <input type="text" name="alamatProvinsi" value={formData.alamatProvinsi} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
