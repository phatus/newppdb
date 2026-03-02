"use client";

import { useState } from "react";
import { createUser, deleteUser, updateUser } from "@/app/actions/users";
import { toast } from "react-hot-toast";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "USER";
    password: string | null;
    emailVerified: Date | null;
    createdAt: Date;
}

import PaginationControl from "../PaginationControl";
import { Suspense } from "react";

interface UserManagementProps {
    initialUsers: User[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export default function UserManagement({
    initialUsers,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
}: UserManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const users = initialUsers;

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as "ADMIN" | "USER";

        if (editingUser) {
            // Update User
            const res = await updateUser(editingUser.id, { role, password });

            if (res.success) {
                toast.success("User berhasil diupdate");
                setIsModalOpen(false);
                setEditingUser(null);
            } else {
                toast.error(res.error || "Gagal update user");
            }
        } else {
            // Create User
            const res = await createUser({ email, password, role });

            if (res.success) {
                toast.success("User berhasil dibuat");
                setIsModalOpen(false);
            } else {
                toast.error(res.error || "Gagal membuat user");
            }
        }
        setLoading(false);
    };

    const handleDeleteUser = async (id: string, email: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus user ${email}?`)) return;

        const toastId = toast.loading("Menghapus user...");
        const res = await deleteUser(id);

        if (res.success) {
            toast.success("User berhasil dihapus", { id: toastId });
        } else {
            toast.error(res.error || "Gagal menghapus user", { id: toastId });
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Daftar Pengguna</h3>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Tambah User
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Email</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Metode</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Role</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Terdaftar</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-[#1e293b]">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 dark:text-white">{user.email}</div>
                                    {user.name && <div className="text-xs text-slate-400">{user.name}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    {!user.password ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                            Google
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            <span className="material-symbols-outlined text-[14px]">mail</span>
                                            Email
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                        day: "numeric", month: "short", year: "numeric"
                                    })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2"
                                        title="Edit User"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.email)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Hapus User"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    Belum ada user tambahan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                    <Suspense fallback={<div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg" />}>
                        <PaginationControl
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                    </Suspense>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingUser ? "Edit User" : "Tambah User Baru"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required={!editingUser}
                                    defaultValue={editingUser?.email}
                                    disabled={!!editingUser}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:ring-2 focus:ring-primary/50"
                                    placeholder="email@sekolah.sch.id"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    defaultValue={editingUser?.role || "USER"}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Password {editingUser && <span className="text-xs font-normal text-slate-500">(Kosongkan jika tidak ubah)</span>}
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required={!editingUser}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                                    placeholder={editingUser ? "Biarkan kosong" : "••••••••"}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Simpan User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
