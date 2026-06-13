import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Search, Edit, Trash2, UsersRound, X, AlertCircle, CheckCircle, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
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
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    
    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    
    const [apiErrors, setApiErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast Notification states
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/adminv1/api/customers');
            if (res.data && res.data.customers) {
                setCustomers(res.data.customers);
            }
        } catch (err) {
            showToast('Gagal memuat data customer.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', phone: '', address: '' });
        setApiErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (customer) => {
        setModalMode('edit');
        setSelectedCustomerId(customer.id);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || ''
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
                await axios.post('/adminv1/api/customers', formData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Customer berhasil ditambahkan.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await axios.put(`/adminv1/api/customers/${selectedCustomerId}`, formData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data customer berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            setIsModalOpen(false);
            fetchCustomers();
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

    const handleDeleteCustomer = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data customer ini akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`/adminv1/api/customers/${id}`);
                    if (res.data && res.data.status === 'success') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Data customer berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        fetchCustomers();
                    }
                } catch (err) {
                    Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus data customer.', 'error');
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
    const filteredCustomers = customers.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = c.email ? c.email.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const phoneMatch = c.phone ? c.phone.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const addressMatch = c.address ? c.address.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return nameMatch || emailMatch || phoneMatch || addressMatch;
    });

    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';
        
        if (typeof valA === 'string') {
            return sortDirection === 'asc' 
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    // Pagination calculations
    const totalEntries = sortedCustomers.length;
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedCustomers.slice(indexOfFirstEntry, indexOfLastEntry);
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
                            placeholder="Cari nama, email, hp, alamat..."
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
                    <span>Tambah Customer</span>
                </button>
            </div>

            {/* Customers Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-semibold text-xs">Memuat data customer...</p>
                    </div>
                ) : currentEntries.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
                        <h4 className="font-bold text-slate-700 text-sm">Customer Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 mt-1">Gunakan kata kunci pencarian lain atau tambah customer baru.</p>
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
                                        onClick={() => handleSort('phone')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Nomor Telepon/HP</span>
                                            {renderSortIcon('phone')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('address')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Alamat</span>
                                            {renderSortIcon('address')}
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {currentEntries.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="py-4 px-6 font-bold text-slate-800">{customer.name}</td>
                                        <td className="py-4 px-6 text-slate-500">{customer.email || <span className="text-slate-300 italic text-[11px]">Belum Diisi</span>}</td>
                                        <td className="py-4 px-6 text-slate-500 font-semibold">{customer.phone || <span className="text-slate-300 italic text-[11px]">Belum Diisi</span>}</td>
                                        <td className="py-4 px-6 text-slate-500 max-w-xs truncate" title={customer.address}>{customer.address || <span className="text-slate-300 italic text-[11px]">Belum Diisi</span>}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-2.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(customer)}
                                                    className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                                    title="Edit Data"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                    title="Hapus Customer"
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
                        Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, totalEntries)} dari {totalEntries} customer
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
                                <UsersRound size={16} />
                                <span>{modalMode === 'create' ? 'Tambah Customer Baru' : 'Edit Data Customer'}</span>
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
                                    placeholder="Masukkan nama lengkap customer"
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
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                        apiErrors.email ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="contoh@email.com (opsional)"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {apiErrors.email && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Nomor Telepon/HP</label>
                                <input
                                    type="text"
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                        apiErrors.phone ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="08xxxxxxxxxx (opsional)"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                {apiErrors.phone && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.phone[0]}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Alamat Lengkap</label>
                                <textarea
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 min-h-[80px] ${
                                        apiErrors.address ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="Masukkan alamat lengkap (opsional)"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                {apiErrors.address && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.address[0]}</p>
                                )}
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
