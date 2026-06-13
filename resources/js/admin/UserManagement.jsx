import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Search, Edit, Trash2, Shield, X, AlertCircle, CheckCircle, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Datatable states
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUserId, setSelectedUserId] = useState(null);
    
    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff'
    });
    
    const [apiErrors, setApiErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast Notification states
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/adminv1/api/users');
            if (res.data && res.data.users) {
                setUsers(res.data.users);
            }
        } catch (err) {
            showToast('Gagal memuat data staff.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', password: '', role: 'staff' });
        setApiErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setModalMode('edit');
        setSelectedUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] || 'staff'
        });
        setApiErrors({});
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setApiErrors({});
        setIsSubmitting(true);

        try {
            if (modalMode === 'create') {
                await axios.post('/adminv1/api/users', formData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Akun staff berhasil ditambahkan.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await axios.put(`/adminv1/api/users/${selectedUserId}`, formData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data staff berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setApiErrors(err.response.data.errors);
            } else if (err.response && err.response.data && err.response.data.message) {
                Swal.fire('Error', err.response.data.message, 'error');
            } else {
                Swal.fire('Error', 'Terjadi kesalahan data. Coba lagi.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data staff ini akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`/adminv1/api/users/${id}`);
                    if (res.data && res.data.status === 'success') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Akun staff berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        fetchUsers();
                    }
                } catch (err) {
                    Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus staff.', 'error');
                }
            }
        });
    };

    // Datatable Sorting handler
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const renderSortIcon = (column) => {
        if (sortColumn !== column) {
            return <ChevronsUpDown size={12} className="text-slate-300 shrink-0" />;
        }
        return sortDirection === 'asc' 
            ? <ChevronUp size={12} className="text-red-600 shrink-0" />
            : <ChevronDown size={12} className="text-red-600 shrink-0" />;
    };

    // Filter, sort & paginate data
    const filteredUsers = users.filter((u) => {
        return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (u.roles.join(', ') || 'staff').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';
        
        if (sortColumn === 'role') {
            valA = a.roles[0] || 'staff';
            valB = b.roles[0] || 'staff';
        }
        
        if (typeof valA === 'string') {
            return sortDirection === 'asc' 
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    // Pagination calculations
    const totalEntries = sortedUsers.length;
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedUsers.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

    return (
        <div className="space-y-6">
            {/* Header Actions Card (Datatable configuration) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Page entry select */}
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                        <span>Tampilkan</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden text-slate-700 font-bold bg-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>data</span>
                    </div>

                    {/* Search box */}
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
                        <Search className="text-slate-400 mr-2 shrink-0" size={16} />
                        <input
                            type="text"
                            placeholder="Cari nama, email, role..."
                            className="bg-transparent focus:outline-hidden text-xs w-full text-slate-700"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Add button */}
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-md shadow-red-500/10 flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                    <Plus size={16} />
                    <span>Tambah Staff / Admin</span>
                </button>
            </div>

            {/* Users Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-semibold text-xs">Memuat data staff...</p>
                    </div>
                ) : currentEntries.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
                        <h4 className="font-bold text-slate-700 text-sm">Staff Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 mt-1">Gunakan kata kunci pencarian lain atau buat staff baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                                    <th 
                                        onClick={() => handleSort('name')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Nama Lengkap</span>
                                            {renderSortIcon('name')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('email')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Alamat Email</span>
                                            {renderSortIcon('email')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('role')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Role Akses</span>
                                            {renderSortIcon('role')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('created_at')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Tgl Terdaftar</span>
                                            {renderSortIcon('created_at')}
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {currentEntries.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="py-4 px-6 font-bold text-slate-800">{user.name}</td>
                                        <td className="py-4 px-6 text-slate-500">{user.email}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                user.roles.includes('admin')
                                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                                    : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                                            }`}>
                                                {user.roles.join(', ') || 'staff'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400 font-semibold">{user.created_at}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-2.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(user)}
                                                    className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                                    title="Edit Data"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                    title="Hapus Staff"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalEntries > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
                    <div>
                        Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, totalEntries)} dari {totalEntries} staff
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                            title="Halaman Sebelumnya"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, index) => {
                            const pageNum = index + 1;
                            const isActive = pageNum === currentPage;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`h-8 w-8 rounded-xl flex items-center justify-center transition border cursor-pointer ${
                                        isActive 
                                            ? 'bg-red-600 border-red-600 text-white shadow-xs' 
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                            title="Halaman Selanjutnya"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 bg-linear-to-r from-red-600 to-red-950 text-white flex justify-between items-center">
                            <h3 className="font-extrabold text-sm flex items-center space-x-1.5 uppercase tracking-wide">
                                <Shield size={16} />
                                <span>{modalMode === 'create' ? 'Tambah Staff / Admin Baru' : 'Edit Data Staff'}</span>
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
                            {/* Name */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                        apiErrors.name ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="Masukkan nama lengkap staff"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                {apiErrors.name && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.name[0]}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Alamat Email</label>
                                <input
                                    type="email"
                                    required
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                        apiErrors.email ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="email@pjm.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {apiErrors.email && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                                    <span>Kata Sandi</span>
                                    {modalMode === 'edit' && <span className="text-[9px] text-slate-400 font-medium lowercase italic">*kosongkan jika tidak diubah</span>}
                                </label>
                                <input
                                    type="password"
                                    required={modalMode === 'create'}
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                        apiErrors.password ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                {apiErrors.password && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.password[0]}</p>
                                )}
                            </div>

                            {/* Role Select */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Role Akses</label>
                                <select
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 bg-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="staff">Staff Operasional</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl transition duration-200 text-xs cursor-pointer"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span>Simpan Perubahan</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toast.show && (
                <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
                    <div className={`flex items-center space-x-2.5 px-4.5 py-3 rounded-xl border shadow-xl text-xs font-bold text-white ${
                        toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/10' : 'bg-rose-600 border-rose-500 shadow-rose-500/10'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
