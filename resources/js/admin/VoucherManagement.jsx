import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Search, Edit, Trash2, Ticket, X, AlertCircle, CheckCircle, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function VoucherManagement() {
    const [vouchers, setVouchers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Datatable states
    const [sortColumn, setSortColumn] = useState('code');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);

    // Form fields
    const [formData, setFormData] = useState({
        code: '',
        type: 'percent',
        value: '',
        min_spend: '',
        max_discount: '',
        quota: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    const [apiErrors, setApiErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toast Notification states
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            // We can retrieve paginated data or fetch all if total is small. Since we have standard index endpoint:
            const res = await axios.get('/adminv1/api/vouchers?per_page=100');
            if (res.data && res.data.data) {
                setVouchers(res.data.data);
            }
        } catch (err) {
            showToast('Gagal memuat data voucher.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({
            code: '',
            type: 'percent',
            value: '',
            min_spend: '0',
            max_discount: '',
            quota: '0',
            start_date: '',
            end_date: '',
            is_active: true
        });
        setApiErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vch) => {
        setModalMode('edit');
        setSelectedVoucherId(vch.id);
        
        // Format dates to YYYY-MM-DD for input fields if they exist
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            return dateStr.substring(0, 10); // get YYYY-MM-DD
        };

        setFormData({
            code: vch.code,
            type: vch.type,
            value: vch.value,
            min_spend: vch.min_spend,
            max_discount: vch.max_discount || '',
            quota: vch.quota,
            start_date: formatDate(vch.start_date),
            end_date: formatDate(vch.end_date),
            is_active: !!vch.is_active
        });
        setApiErrors({});
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setApiErrors({});
        setIsSubmitting(true);

        const payload = {
            ...formData,
            max_discount: formData.max_discount === '' ? null : formData.max_discount,
            start_date: formData.start_date === '' ? null : formData.start_date,
            end_date: formData.end_date === '' ? null : formData.end_date,
        };

        try {
            if (modalMode === 'create') {
                await axios.post('/adminv1/api/vouchers', payload);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Voucher baru berhasil dibuat.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await axios.put(`/adminv1/api/vouchers/${selectedVoucherId}`, payload);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data voucher berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            setIsModalOpen(false);
            fetchVouchers();
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

    const handleDeleteVoucher = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Data voucher ini akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/adminv1/api/vouchers/${id}`);
                    Swal.fire({
                        title: 'Terhapus!',
                        text: 'Voucher berhasil dihapus.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchVouchers();
                } catch (err) {
                    Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus voucher.', 'error');
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
    const filteredVouchers = vouchers.filter((v) => {
        return v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
               v.type.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const sortedVouchers = [...filteredVouchers].sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';
        
        if (typeof valA === 'string') {
            return sortDirection === 'asc' 
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    // Pagination calculations
    const totalEntries = sortedVouchers.length;
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedVouchers.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

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
                            placeholder="Cari kode promo..."
                            className="bg-transparent focus:outline-hidden text-xs w-full text-slate-700 font-bold"
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
                    <span>Tambah Voucher Promo</span>
                </button>
            </div>

            {/* Vouchers Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-semibold text-xs">Memuat data voucher...</p>
                    </div>
                ) : currentEntries.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
                        <h4 className="font-bold text-slate-700 text-sm">Voucher Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 mt-1">Buat voucher baru untuk memulai promosi.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                                    <th 
                                        onClick={() => handleSort('code')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Kode Voucher</span>
                                            {renderSortIcon('code')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('type')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Tipe Potongan</span>
                                            {renderSortIcon('type')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('value')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Nilai Diskon</span>
                                            {renderSortIcon('value')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('min_spend')}
                                        className="py-4 px-6 cursor-pointer hover:bg-slate-100/80 transition"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>Min. Belanja</span>
                                            {renderSortIcon('min_spend')}
                                        </div>
                                    </th>
                                    <th className="py-4 px-6">Batas Kuota</th>
                                    <th className="py-4 px-6">Masa Berlaku</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {currentEntries.map((vch) => (
                                    <tr key={vch.id} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="py-4 px-6 font-bold text-slate-800">
                                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100 text-xs font-extrabold tracking-wide uppercase">
                                                {vch.code}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 capitalize">{vch.type === 'percent' ? 'Persentase (%)' : 'Potongan Langsung (Rp)'}</td>
                                        <td className="py-4 px-6 font-extrabold text-slate-800">
                                            {vch.type === 'percent' ? `${vch.value}%` : `Rp ${vch.value.toLocaleString('id-ID')}`}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 font-semibold">
                                            Rp {vch.min_spend.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 font-semibold">
                                            {vch.quota > 0 ? (
                                                <span>{vch.used} / {vch.quota} terpakai</span>
                                            ) : (
                                                <span>{vch.used} / ∞ (Tanpa Batas)</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-slate-400 font-semibold">
                                            {vch.start_date ? (
                                                <div className="space-y-0.5">
                                                    <div>{vch.start_date.substring(0, 10)}</div>
                                                    <div className="text-[10px] text-slate-300">s/d {vch.end_date ? vch.end_date.substring(0,10) : '—'}</div>
                                                </div>
                                            ) : (
                                                <span>Selalu Aktif</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                vch.is_active
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                            }`}>
                                                {vch.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-2.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(vch)}
                                                    className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                                    title="Edit Voucher"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVoucher(vch.id)}
                                                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                    title="Hapus Voucher"
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
                        Menampilkan {indexOfFirstEntry + 1} sampai {Math.min(indexOfLastEntry, totalEntries)} dari {totalEntries} voucher
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
                                <Ticket size={16} />
                                <span>{modalMode === 'create' ? 'Tambah Voucher Promo Baru' : 'Edit Voucher Promo'}</span>
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
                            {/* Code */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Kode Voucher</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 uppercase ${
                                        apiErrors.code ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="Contoh: PJMHEBOH"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                                {apiErrors.code && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.code[0]}</p>
                                )}
                            </div>

                            {/* Grid type and value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">Tipe Diskon</label>
                                    <select
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 bg-white"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="percent">Persentase (%)</option>
                                        <option value="fixed">Nominal Rupiah (Rp)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">
                                        Nilai {formData.type === 'percent' ? '(%)' : '(Rupiah)'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                            apiErrors.value ? 'border-rose-500' : 'border-slate-200'
                                        }`}
                                        placeholder={formData.type === 'percent' ? 'Contoh: 10' : 'Contoh: 25000'}
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    />
                                    {apiErrors.value && (
                                        <p className="text-rose-500 text-[10px] font-bold">{apiErrors.value[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Grid spend and max cap */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">Min. Belanja (Rp)</label>
                                    <input
                                        type="number"
                                        required
                                        className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                            apiErrors.min_spend ? 'border-rose-500' : 'border-slate-200'
                                        }`}
                                        value={formData.min_spend}
                                        onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                                    />
                                    {apiErrors.min_spend && (
                                        <p className="text-rose-500 text-[10px] font-bold">{apiErrors.min_spend[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider">
                                        Max Potongan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        disabled={formData.type === 'fixed'}
                                        className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                            formData.type === 'fixed' ? 'bg-slate-100 text-slate-400' : ''
                                        } ${apiErrors.max_discount ? 'border-rose-500' : 'border-slate-200'}`}
                                        placeholder="Kosongkan jika bebas"
                                        value={formData.type === 'fixed' ? '' : formData.max_discount}
                                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                    />
                                    {apiErrors.max_discount && (
                                        <p className="text-rose-500 text-[10px] font-bold">{apiErrors.max_discount[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Quota */}
                            <div className="space-y-1">
                                <label className="text-slate-400 font-bold uppercase tracking-wider">Batas Kuota Pemakaian (Kali)</label>
                                <input
                                    type="number"
                                    required
                                    className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 ${
                                        apiErrors.quota ? 'border-rose-500' : 'border-slate-200'
                                    }`}
                                    placeholder="0 jika tak terbatas"
                                    value={formData.quota}
                                    onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                                />
                                {apiErrors.quota && (
                                    <p className="text-rose-500 text-[10px] font-bold">{apiErrors.quota[0]}</p>
                                )}
                            </div>

                            {/* Dates Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>Tgl Mulai</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>Tgl Berakhir</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Is Active Toggle */}
                            <div className="flex items-center space-x-3 py-1">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    className="h-4.5 w-4.5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="text-slate-700 font-bold select-none cursor-pointer">
                                    Voucher ini Aktif & Dapat Digunakan Customer
                                </label>
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
                                        <span>Simpan Voucher</span>
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
