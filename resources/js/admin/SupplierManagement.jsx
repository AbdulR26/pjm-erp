import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Search, Edit, Trash2, UsersRound, X, AlertCircle, CheckCircle, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SupplierManagement() {
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Datatable states
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [pagination, setPagination] = useState({});
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    
    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        company_name: '',
        phone: '',
        email: '',
        address: ''
    });
    
    const [apiErrors, setApiErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/adminv1/api/suppliers', {
                params: {
                    search: searchQuery || undefined,
                    page: currentPage,
                    per_page: entriesPerPage
                }
            });
            if (res.data) {
                setSuppliers(res.data.data || []);
                setPagination(res.data);
            }
        } catch (err) {
            showToast('Gagal memuat data supplier.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [currentPage, entriesPerPage, searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', code: '', company_name: '', phone: '', email: '', address: '' });
        setApiErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (supplier) => {
        setModalMode('edit');
        setSelectedSupplierId(supplier.id);
        setFormData({
            name: supplier.name,
            code: supplier.code,
            company_name: supplier.company_name || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || ''
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
                await axios.post('/adminv1/api/suppliers', formData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Supplier berhasil ditambahkan.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await axios.put(`/adminv1/api/suppliers/${selectedSupplierId}`, formData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data supplier berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setApiErrors(err.response.data.errors);
            } else if (err.response && err.response.data && err.response.data.message) {
                Swal.fire('Error', err.response.data.message, 'error');
            } else {
                Swal.fire('Error', 'Terjadi kesalahan. Silakan coba lagi.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSupplier = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data supplier ini akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`/adminv1/api/suppliers/${id}`);
                    if (res.data && res.data.status === 'success') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Data supplier berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        fetchSuppliers();
                    }
                } catch (err) {
                    Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus data supplier.', 'error');
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Actions Card */}
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
                            placeholder="Cari kode, nama, perusahaan..."
                            className="bg-transparent focus:outline-hidden text-xs w-full text-slate-700"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="text-slate-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Add button */}
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-red-650 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-md shadow-red-500/10 flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                    <Plus size={16} />
                    <span>Tambah Supplier</span>
                </button>
            </div>

            {/* Suppliers Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-semibold text-xs">Memuat data supplier...</p>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
                        <h4 className="font-bold text-slate-700 text-sm">Supplier Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 mt-1">Gunakan kata kunci pencarian lain atau tambah supplier baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                                    <th className="py-4 px-6">Kode Supplier</th>
                                    <th className="py-4 px-6">Nama Kontak</th>
                                    <th className="py-4 px-6">Nama Perusahaan</th>
                                    <th className="py-4 px-6">Telepon / HP</th>
                                    <th className="py-4 px-6">Alamat Email</th>
                                    <th className="py-4 px-6">Alamat Lengkap</th>
                                    <th className="py-4 px-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="py-4 px-6 font-mono font-bold text-slate-800">{supplier.code}</td>
                                        <td className="py-4 px-6 font-bold text-slate-800">{supplier.name}</td>
                                        <td className="py-4 px-6 text-slate-600">{supplier.company_name || <span className="text-slate-300 italic text-[11px]">-</span>}</td>
                                        <td className="py-4 px-6 text-slate-500 font-semibold">{supplier.phone || <span className="text-slate-300 italic text-[11px]">-</span>}</td>
                                        <td className="py-4 px-6 text-slate-500">{supplier.email || <span className="text-slate-300 italic text-[11px]">-</span>}</td>
                                        <td className="py-4 px-6 text-slate-500 max-w-xs truncate" title={supplier.address}>
                                            {supplier.address || <span className="text-slate-300 italic text-[11px]">-</span>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-2.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(supplier)}
                                                    className="p-1.5 bg-red-50 text-red-650 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                                    title="Edit Data"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSupplier(supplier.id)}
                                                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                    title="Hapus Supplier"
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
            {!isLoading && pagination.total > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
                    <div>
                        Menampilkan {pagination.from || 0} sampai {pagination.to || 0} dari {pagination.total || 0} supplier
                    </div>
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-center space-x-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            
                            {Array.from({ length: pagination.last_page }).map((_, index) => {
                                const pageNum = index + 1;
                                const isActive = pageNum === currentPage;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`h-8 w-8 rounded-xl flex items-center justify-center transition border cursor-pointer ${
                                            isActive 
                                                ? 'bg-red-650 border-red-650 text-white shadow-xs' 
                                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                disabled={currentPage === pagination.last_page}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                                title="Halaman Selanjutnya"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 bg-linear-to-r from-red-600 to-red-950 text-white flex justify-between items-center">
                            <h3 className="font-extrabold text-sm flex items-center space-x-1.5 uppercase tracking-wide">
                                <UsersRound size={16} />
                                <span>{modalMode === 'create' ? 'Tambah Supplier Baru' : 'Edit Data Supplier'}</span>
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700 max-h-[85vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">Kode Supplier *</label>
                                    <input
                                        type="text"
                                        required
                                        className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 uppercase ${
                                            apiErrors.code ? 'border-rose-500' : 'border-slate-200'
                                        }`}
                                        placeholder="Misal: SPL-01"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        disabled={modalMode === 'edit'} // Disable editing of supplier code to maintain consistency
                                    />
                                    {apiErrors.code && (
                                        <p className="text-rose-500 text-[10px] font-bold">{apiErrors.code[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">Nama Kontak *</label>
                                    <input
                                        type="text"
                                        required
                                        className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                            apiErrors.name ? 'border-rose-500' : 'border-slate-200'
                                        }`}
                                        placeholder="Nama PIC Supplier"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {apiErrors.name && (
                                        <p className="text-rose-500 text-[10px] font-bold">{apiErrors.name[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Nama Perusahaan (Opsional)</label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 border-slate-200"
                                    placeholder="PT / CV Supplier"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">Nomor HP / Telepon</label>
                                    <input
                                        type="text"
                                        className="w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 border-slate-200"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">Alamat Email</label>
                                    <input
                                        type="email"
                                        className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                            apiErrors.email ? 'border-rose-500' : 'border-slate-200'
                                        }`}
                                        placeholder="supplier@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {apiErrors.email && (
                                        <p className="text-rose-500 text-[10px] font-bold">{apiErrors.email[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Alamat Lengkap</label>
                                <textarea
                                    className="w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 border-slate-200 min-h-[80px]"
                                    placeholder="Jalan, Kota, Provinsi..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
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
                                    className="bg-red-650 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
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
