import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    Plus, Search, Edit, Trash2, X, AlertCircle, CheckCircle, 
    ChevronLeft, ChevronRight, FileText, Printer, Check, Send, 
    Undo, RefreshCw, Calendar, DollarSign, ArrowLeft, Loader2
} from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
    { id: 'all',       label: 'Semua',       color: 'slate' },
    { id: 'draft',     label: 'Draft',       color: 'slate' },
    { id: 'ordered',   label: 'Dipesan',     color: 'blue' },
    { id: 'received',  label: 'Diterima',    color: 'green' },
    { id: 'cancelled', label: 'Dibatalkan',  color: 'red' },
];

const PO_STATUS_CONFIG = {
    draft:     { label: 'Draft',      bg: 'bg-slate-100',   text: 'text-slate-700' },
    ordered:   { label: 'Dipesan',    bg: 'bg-blue-100',    text: 'text-blue-700' },
    received:  { label: 'Diterima',   bg: 'bg-green-100',   text: 'text-green-700' },
    cancelled: { label: 'Dibatalkan', bg: 'bg-red-100',     text: 'text-red-700' },
};

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export default function POManagement() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    
    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [pagination, setPagination] = useState({});
    
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // View/Create modes
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'edit' | 'detail'
    const [selectedPo, setSelectedPo] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        tax: 0,
        shipping_cost: 0,
        items: [] // { product_variant_id, variant_name, product_name, sku, quantity, unit_cost, total_cost }
    });
    
    const [searchProduct, setSearchProduct] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [apiErrors, setApiErrors] = useState({});

    // Receive modal states
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [receiveItems, setReceiveItems] = useState([]); // { product_variant_id, variant_name, product_name, sku, quantity, quantity_received, quantity_to_receive }

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('/adminv1/api/suppliers?per_page=100');
            setSuppliers(res.data.data || []);
        } catch {}
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/adminv1/api/products?per_page=200');
            setProducts(res.data.data || []);
        } catch {}
    };

    const fetchPOs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/adminv1/api/purchase-orders', {
                params: {
                    search: searchQuery || undefined,
                    status: statusFilter,
                    page: currentPage,
                    per_page: entriesPerPage
                }
            });
            if (res.data) {
                setPurchaseOrders(res.data.data || []);
                setPagination(res.data);
            }
        } catch {
            Swal.fire('Error', 'Gagal memuat data Purchase Order.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, entriesPerPage, searchQuery, statusFilter]);

    useEffect(() => {
        fetchPOs();
    }, [fetchPOs]);

    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // PO Form items handling
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.variants?.some(v => v.sku?.toLowerCase().includes(searchProduct.toLowerCase()))
    );

    const addItemToPo = (variant, product) => {
        const exists = formData.items.find(i => i.product_variant_id === variant.id);
        if (exists) {
            Swal.fire('Info', 'Produk varian ini sudah ditambahkan ke dalam daftar.', 'info');
            return;
        }

        const newItem = {
            product_variant_id: variant.id,
            variant_name: variant.name,
            product_name: product.name,
            sku: variant.sku,
            quantity: 1,
            unit_cost: variant.base_price || 0,
            total_cost: variant.base_price || 0
        };

        setFormData(f => ({ ...f, items: [...f.items, newItem] }));
        setSearchProduct('');
        setShowProductSearch(false);
    };

    const removeItemFromPo = (variantId) => {
        setFormData(f => ({ ...f, items: f.items.filter(i => i.product_variant_id !== variantId) }));
    };

    const updateItemQty = (variantId, qty) => {
        setFormData(f => ({
            ...f,
            items: f.items.map(i => {
                if (i.product_variant_id === variantId) {
                    const newQty = Math.max(1, Number(qty));
                    return { ...i, quantity: newQty, total_cost: newQty * i.unit_cost };
                }
                return i;
            })
        }));
    };

    const updateItemCost = (variantId, cost) => {
        setFormData(f => ({
            ...f,
            items: f.items.map(i => {
                if (i.product_variant_id === variantId) {
                    const newCost = Math.max(0, Number(cost));
                    return { ...i, unit_cost: newCost, total_cost: i.quantity * newCost };
                }
                return i;
            })
        }));
    };

    // Calculate totals
    const calculateSubtotal = () => formData.items.reduce((acc, item) => acc + item.total_cost, 0);
    const subtotal = calculateSubtotal();
    const grandTotal = subtotal + Number(formData.tax || 0) + Number(formData.shipping_cost || 0);

    const handleOpenCreateMode = () => {
        setFormData({
            supplier_id: '',
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery_date: '',
            notes: '',
            tax: 0,
            shipping_cost: 0,
            items: []
        });
        setApiErrors({});
        setViewMode('create');
    };

    const handleOpenEditMode = (po) => {
        setSelectedPo(po);
        setFormData({
            supplier_id: po.supplier_id,
            order_date: po.order_date ? po.order_date.split('T')[0] : '',
            expected_delivery_date: po.expected_delivery_date ? po.expected_delivery_date.split('T')[0] : '',
            notes: po.notes || '',
            tax: po.tax,
            shipping_cost: po.shipping_cost,
            items: po.items.map(item => ({
                product_variant_id: item.product_variant_id,
                variant_name: item.variant?.name || 'Default',
                product_name: item.variant?.product?.name || 'Produk',
                sku: item.variant?.sku || '-',
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                total_cost: item.total_cost
            }))
        });
        setApiErrors({});
        setViewMode('edit');
    };

    const handleSubmitPO = async (e) => {
        e.preventDefault();
        if (!formData.supplier_id) {
            Swal.fire('Error', 'Pilih supplier terlebih dahulu.', 'error');
            return;
        }
        if (formData.items.length === 0) {
            Swal.fire('Error', 'Tambahkan minimal 1 item produk.', 'error');
            return;
        }
        
        setIsSubmitting(true);
        setApiErrors({});
        try {
            if (viewMode === 'create') {
                await axios.post('/adminv1/api/purchase-orders', formData);
                Swal.fire('Berhasil!', 'Purchase Order berhasil dibuat.', 'success');
            } else {
                await axios.put(`/adminv1/api/purchase-orders/${selectedPo.id}`, formData);
                Swal.fire('Berhasil!', 'Purchase Order berhasil diperbarui.', 'success');
            }
            setViewMode('list');
            fetchPOs();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setApiErrors(err.response.data.errors);
            } else {
                Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan Purchase Order.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDetail = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/adminv1/api/purchase-orders/${id}`);
            setSelectedPo(res.data);
            setViewMode('detail');
        } catch {
            Swal.fire('Error', 'Gagal memuat detail Purchase Order.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendPO = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Kirim Purchase Order?',
            text: 'Status PO akan berubah menjadi "Ordered/Dipesan" dan tidak dapat diedit kembali.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal'
        });

        if (confirmResult.isConfirmed) {
            setIsSubmitting(true);
            try {
                const poToUpdate = selectedPo && selectedPo.id === id ? selectedPo : purchaseOrders.find(po => po.id === id);
                const itemsPayload = poToUpdate.items.map(item => ({
                    product_variant_id: item.product_variant_id,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost
                }));

                await axios.put(`/adminv1/api/purchase-orders/${id}`, {
                    supplier_id: poToUpdate.supplier_id,
                    order_date: poToUpdate.order_date ? poToUpdate.order_date.split('T')[0] : '',
                    expected_delivery_date: poToUpdate.expected_delivery_date ? poToUpdate.expected_delivery_date.split('T')[0] : '',
                    notes: poToUpdate.notes || '',
                    status: 'ordered',
                    tax: poToUpdate.tax,
                    shipping_cost: poToUpdate.shipping_cost,
                    items: itemsPayload
                });
                
                Swal.fire('Berhasil!', 'Purchase Order telah ditandai sebagai Dipesan.', 'success');
                if (viewMode === 'detail') {
                    handleOpenDetail(id);
                } else {
                    fetchPOs();
                }
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Gagal mengubah status PO.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleCancelPO = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Batalkan Purchase Order?',
            text: 'PO akan dibatalkan secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Batalkan!',
            cancelButtonText: 'Kembali'
        });

        if (confirmResult.isConfirmed) {
            setIsSubmitting(true);
            try {
                const poToUpdate = selectedPo && selectedPo.id === id ? selectedPo : purchaseOrders.find(po => po.id === id);
                const itemsPayload = poToUpdate.items.map(item => ({
                    product_variant_id: item.product_variant_id,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost
                }));

                await axios.put(`/adminv1/api/purchase-orders/${id}`, {
                    supplier_id: poToUpdate.supplier_id,
                    order_date: poToUpdate.order_date ? poToUpdate.order_date.split('T')[0] : '',
                    expected_delivery_date: poToUpdate.expected_delivery_date ? poToUpdate.expected_delivery_date.split('T')[0] : '',
                    notes: poToUpdate.notes || '',
                    status: 'cancelled',
                    tax: poToUpdate.tax,
                    shipping_cost: poToUpdate.shipping_cost,
                    items: itemsPayload
                });

                Swal.fire('Berhasil!', 'Purchase Order telah dibatalkan.', 'success');
                if (viewMode === 'detail') {
                    handleOpenDetail(id);
                } else {
                    fetchPOs();
                }
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Gagal membatalkan PO.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDeletePO = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Hapus Purchase Order?',
            text: 'Data PO draft akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (confirmResult.isConfirmed) {
            setIsSubmitting(true);
            try {
                await axios.delete(`/adminv1/api/purchase-orders/${id}`);
                Swal.fire('Berhasil!', 'Purchase Order draft berhasil dihapus.', 'success');
                fetchPOs();
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus PO.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Receive Items functionality
    const handleOpenReceiveModal = () => {
        if (!selectedPo) return;
        setReceiveItems(selectedPo.items.map(item => ({
            product_variant_id: item.product_variant_id,
            variant_name: item.variant?.name || 'Default',
            product_name: item.variant?.product?.name || 'Produk',
            sku: item.variant?.sku || '-',
            quantity: item.quantity,
            quantity_received: item.quantity_received || 0,
            quantity_to_receive: item.quantity - (item.quantity_received || 0) // default to remainder
        })));
        setIsReceiveModalOpen(true);
    };

    const handleUpdateQtyToReceive = (variantId, qty) => {
        setReceiveItems(prev => prev.map(item => {
            if (item.product_variant_id === variantId) {
                // Max quantity is remainder: quantity - quantity_received
                const remainder = item.quantity - item.quantity_received;
                const newQty = Math.max(0, Math.min(remainder, Number(qty)));
                return { ...item, quantity_to_receive: newQty };
            }
            return item;
        }));
    };

    const handleProcessReceive = async () => {
        setIsSubmitting(true);
        try {
            // Build receiving items payload
            const payload = {
                items: receiveItems.map(item => ({
                    product_variant_id: item.product_variant_id,
                    // The backend API receive method takes the cumulative quantity_received value: old_received + new_received
                    quantity_received: item.quantity_received + item.quantity_to_receive
                }))
            };

            const res = await axios.post(`/adminv1/api/purchase-orders/${selectedPo.id}/receive`, payload);
            if (res.data && res.data.status === 'success') {
                Swal.fire('Berhasil!', 'Penerimaan barang PO berhasil dicatat. Stok gudang otomatis diperbarui.', 'success');
                setIsReceiveModalOpen(false);
                handleOpenDetail(selectedPo.id);
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Gagal memproses penerimaan barang PO.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openPrintPO = (id) => {
        window.open(`/adminv1/api/purchase-orders/${id}/print`, '_blank');
    };

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <FileText className="text-red-500" size={22} />
                            {viewMode === 'create' ? 'Buat Purchase Order Baru' : `Edit Purchase Order #${selectedPo?.po_number}`}
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">Lengkapi formulir pembelian untuk mengirim pesanan barang ke supplier</p>
                    </div>
                    <button 
                        onClick={() => setViewMode('list')} 
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 bg-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Kembali
                    </button>
                </div>

                <form onSubmit={handleSubmitPO} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Form Panel */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b pb-2">Detail Transaksi PO</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650">Supplier *</label>
                                <select 
                                    value={formData.supplier_id} 
                                    onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white cursor-pointer"
                                >
                                    <option value="">-- Pilih Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.company_name || 'Personal'})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650">Tanggal Order *</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.order_date} 
                                        onChange={e => setFormData({ ...formData, order_date: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-655">Estimasi Tanggal Datang (Opsional)</label>
                                <input 
                                    type="date" 
                                    value={formData.expected_delivery_date} 
                                    onChange={e => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650">Catatan Khusus PO</label>
                                <input 
                                    type="text" 
                                    placeholder="Catatan tambahan untuk supplier..."
                                    value={formData.notes} 
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white"
                                />
                            </div>
                        </div>

                        {/* Search Variant Adder */}
                        <div className="pt-2">
                            <label className="text-xs font-bold text-slate-650 block mb-1">Cari & Tambah Produk Varian</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Masukkan nama produk atau SKU varian..."
                                    value={searchProduct}
                                    onChange={e => { setSearchProduct(e.target.value); setShowProductSearch(true); }}
                                    onFocus={() => setShowProductSearch(true)}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                />
                                {showProductSearch && searchProduct && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-56 overflow-y-auto">
                                        {filteredProducts.length === 0 ? (
                                            <p className="p-3 text-xs text-slate-500 text-center">Produk/SKU tidak ditemukan</p>
                                        ) : (
                                            filteredProducts.map(p => p.variants?.map(v => (
                                                <button 
                                                    type="button" 
                                                    key={v.id} 
                                                    onClick={() => addItemToPo(v, p)}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0"
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800">{p.name} <span className="text-slate-500 font-medium">- {v.name}</span></p>
                                                        <p className="text-[10px] text-slate-400">SKU: {v.sku} • Stok Gudang: {v.stock}</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-red-650 shrink-0 ml-3">{fmt(v.base_price)}</p>
                                                </button>
                                            )))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="pt-2 space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Daftar Item PO ({formData.items.length})</p>
                            {formData.items.length === 0 ? (
                                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-semibold">
                                    Belum ada produk yang ditambahkan. Gunakan pencarian produk di atas.
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 select-none">
                                            <tr>
                                                <th className="py-3 px-4">Item Produk</th>
                                                <th className="py-3 px-4 w-24 text-center">Qty Order</th>
                                                <th className="py-3 px-4 w-32 text-right">Harga Beli (Rp)</th>
                                                <th className="py-3 px-4 w-28 text-right">Total</th>
                                                <th className="py-3 px-3 w-10 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {formData.items.map((item) => (
                                                <tr key={item.product_variant_id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4">
                                                        <p className="font-bold text-slate-800">{item.product_name}</p>
                                                        <p className="text-[10px] text-slate-400">Varian: {item.variant_name} · SKU: {item.sku}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <input 
                                                            type="number" 
                                                            required
                                                            min="1"
                                                            value={item.quantity} 
                                                            onChange={e => updateItemQty(item.product_variant_id, e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-bold focus:outline-none focus:border-red-400"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <input 
                                                            type="number" 
                                                            required
                                                            min="0"
                                                            value={item.unit_cost} 
                                                            onChange={e => updateItemCost(item.product_variant_id, e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg py-1 px-2 text-right text-xs font-bold focus:outline-none focus:border-red-400 font-mono"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-800">
                                                        {fmt(item.total_cost)}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeItemFromPo(item.product_variant_id)}
                                                            className="p-1 text-slate-400 hover:text-red-500 rounded-md transition"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Totals Panel */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b pb-2">Ringkasan Total</h3>
                            
                            <div className="space-y-3 text-xs font-semibold text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal Item</span>
                                    <span className="font-bold font-mono">{fmt(subtotal)}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span>Biaya Pajak (Opsional)</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={formData.tax} 
                                            onChange={e => setFormData({ ...formData, tax: Math.max(0, Number(e.target.value)) })}
                                            className="w-28 border border-slate-200 rounded-lg py-1 px-2 text-right text-xs font-bold focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span>Biaya Kirim (Opsional)</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={formData.shipping_cost} 
                                            onChange={e => setFormData({ ...formData, shipping_cost: Math.max(0, Number(e.target.value)) })}
                                            className="w-28 border border-slate-200 rounded-lg py-1 px-2 text-right text-xs font-bold focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between text-base font-black text-slate-800 pt-3 border-t">
                                    <span>Total Pembelian</span>
                                    <span className="text-red-650 font-mono">{fmt(grandTotal)}</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-650 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition shadow-md shadow-red-500/10 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <FileText size={16} />}
                                Simpan Purchase Order
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedPo) {
        const poStatus = PO_STATUS_CONFIG[selectedPo.status] || PO_STATUS_CONFIG.draft;
        return (
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <FileText className="text-red-500" size={22} />
                            Purchase Order #{selectedPo.po_number}
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">Dibuat oleh {selectedPo.creator?.name || 'System'} pada {formatDate(selectedPo.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => openPrintPO(selectedPo.id)} 
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 bg-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                            <Printer size={14} /> Cetak PO
                        </button>
                        {selectedPo.status === 'draft' && (
                            <>
                                <button 
                                    onClick={() => handleOpenEditMode(selectedPo)} 
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-650 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    <Edit size={14} /> Edit PO
                                </button>
                                <button 
                                    onClick={() => handleSendPO(selectedPo.id)} 
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    <Send size={14} /> Set Dipesan (Kirim)
                                </button>
                            </>
                        )}
                        {selectedPo.status === 'ordered' && (
                            <button 
                                onClick={handleOpenReceiveModal} 
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition cursor-pointer animate-pulse"
                            >
                                <Check size={14} /> Terima Barang PO
                            </button>
                        )}
                        {selectedPo.status !== 'received' && selectedPo.status !== 'cancelled' && (
                            <button 
                                onClick={() => handleCancelPO(selectedPo.id)} 
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                <X size={14} /> Batalkan PO
                            </button>
                        )}
                        <button 
                            onClick={() => { setViewMode('list'); setSelectedPo(null); }} 
                            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 bg-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Kembali
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Details Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Supplier and Shipping Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">Supplier</p>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{selectedPo.supplier?.name}</p>
                                    <p className="text-xs text-slate-500 font-semibold">{selectedPo.supplier?.company_name || 'Personal'}</p>
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-1">Tlp: {selectedPo.supplier?.phone || '-'}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">Email: {selectedPo.supplier?.email || '-'}</p>
                                <p className="text-xs text-slate-400 leading-relaxed pt-1">{selectedPo.supplier?.address || '-'}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">Detail Pengiriman PO</p>
                                <table className="w-full text-xs font-semibold text-slate-600 space-y-1.5">
                                    <tbody>
                                        <tr><td className="py-1 text-slate-400">Tgl Order:</td><td className="py-1 font-bold text-slate-800">{formatDate(selectedPo.order_date)}</td></tr>
                                        <tr><td className="py-1 text-slate-400">Estimasi Tgl Datang:</td><td className="py-1 font-bold text-slate-800">{formatDate(selectedPo.expected_delivery_date)}</td></tr>
                                        <tr><td className="py-1 text-slate-400">Tgl Diterima:</td><td className="py-1 font-bold text-slate-800">{formatDate(selectedPo.received_date)}</td></tr>
                                    </tbody>
                                </table>
                                <div className="pt-2">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${poStatus.bg} ${poStatus.text}`}>
                                        {poStatus.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items ordered table */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                            <div className="px-5 py-4 border-b bg-slate-50/50">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Daftar Item Barang PO</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs md:text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                                            <th className="py-3.5 px-5">Item Produk</th>
                                            <th className="py-3.5 px-5 text-center">Qty Order</th>
                                            <th className="py-3.5 px-5 text-center">Qty Terima</th>
                                            <th className="py-3.5 px-5 text-right">Harga Beli</th>
                                            <th className="py-3.5 px-5 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {selectedPo.items?.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="py-3.5 px-5">
                                                    <p className="font-bold text-slate-800">{item.variant?.product?.name}</p>
                                                    <p className="text-[10px] text-slate-400">Varian: {item.variant?.name || 'Default'} · SKU: {item.variant?.sku || '-'}</p>
                                                </td>
                                                <td className="py-3.5 px-5 text-center font-bold">{item.quantity}</td>
                                                <td className="py-3.5 px-5 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                                                        item.quantity_received === item.quantity 
                                                            ? 'bg-green-50 text-green-700' 
                                                            : item.quantity_received > 0 
                                                                ? 'bg-amber-50 text-amber-700' 
                                                                : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {item.quantity_received} / {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right font-mono font-semibold">{fmt(item.unit_cost)}</td>
                                                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800">{fmt(item.total_cost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {selectedPo.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Catatan PO</p>
                                <p className="text-xs text-amber-800 leading-relaxed font-semibold">{selectedPo.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Totals Panel */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-3.5 text-xs font-semibold text-slate-600">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ringkasan Total Pembelian</h3>
                            
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold font-mono">{fmt(selectedPo.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Pajak</span>
                                <span className="font-bold font-mono">{fmt(selectedPo.tax)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Kirim</span>
                                <span className="font-bold font-mono">{fmt(selectedPo.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-slate-800 pt-3 border-t">
                                <span>Grand Total</span>
                                <span className="text-red-650 font-mono">{fmt(selectedPo.grand_total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receive Items Modal */}
                {isReceiveModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center">
                                <h3 className="font-extrabold text-sm flex items-center space-x-1.5 uppercase tracking-wide">
                                    <Check size={16} />
                                    <span>Penerimaan Barang PO #{selectedPo.po_number}</span>
                                </h3>
                                <button onClick={() => setIsReceiveModalOpen(false)} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 text-xs font-semibold text-slate-700 max-h-[75vh] overflow-y-auto">
                                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 flex gap-2">
                                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                    <p className="leading-relaxed">Masukkan jumlah item barang yang Anda terima saat ini. Jumlah stok pada <strong>Manajemen Stok</strong> akan bertambah otomatis berdasarkan input penerimaan.</p>
                                </div>

                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                                            <tr>
                                                <th className="py-2.5 px-4">Nama Produk</th>
                                                <th className="py-2.5 px-4 text-center">Dipesan</th>
                                                <th className="py-2.5 px-4 text-center">Telah Diterima</th>
                                                <th className="py-2.5 px-4 text-center w-32">Diterima Sekarang</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {receiveItems.map((item) => (
                                                <tr key={item.product_variant_id}>
                                                    <td className="py-2.5 px-4">
                                                        <p className="font-bold text-slate-800">{item.product_name}</p>
                                                        <p className="text-[10px] text-slate-400">Varian: {item.variant_name} · SKU: {item.sku}</p>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center font-bold">{item.quantity}</td>
                                                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">{item.quantity_received}</td>
                                                    <td className="py-2.5 px-4">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            max={item.quantity - item.quantity_received}
                                                            value={item.quantity_to_receive}
                                                            onChange={e => handleUpdateQtyToReceive(item.product_variant_id, e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg py-1 px-2 text-center text-xs font-bold focus:outline-none focus:border-green-500"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsReceiveModalOpen(false)} 
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer text-xs"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleProcessReceive} 
                                        disabled={isSubmitting}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 cursor-pointer text-xs flex items-center gap-1.5"
                                    >
                                        {isSubmitting ? <Loader2 size={12} className="animate-spin text-white" /> : <Check size={14} />} Simpan & Update Stok
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List mode view
    return (
        <div className="space-y-6">
            {/* Header / Actions bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Entries selector */}
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
                            placeholder="Cari PO Number, Supplier..."
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
                    onClick={handleOpenCreateMode}
                    className="bg-red-650 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-md shadow-red-500/10 flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                    <Plus size={16} />
                    <span>Buat PO Baru</span>
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {STATUS_FILTER_OPTIONS.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => handleStatusFilterChange(tab.id)}
                        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition ${
                            statusFilter === tab.id 
                                ? 'bg-slate-800 text-white shadow' 
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* PO Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-semibold text-xs">Memuat data Purchase Order...</p>
                    </div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
                        <h4 className="font-bold text-slate-700 text-sm">Purchase Order Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 mt-1">Coba ubah status filter atau buat PO baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                                    <th className="py-4 px-6">No PO</th>
                                    <th className="py-4 px-6">Supplier</th>
                                    <th className="py-4 px-6">Tgl Order</th>
                                    <th className="py-4 px-6">Estimasi Datang</th>
                                    <th className="py-4 px-6 text-right">Grand Total</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {purchaseOrders.map((po) => {
                                    const poStatus = PO_STATUS_CONFIG[po.status] || PO_STATUS_CONFIG.draft;
                                    return (
                                        <tr key={po.id} className="hover:bg-slate-50/50 transition duration-150">
                                            <td className="py-4 px-6 font-mono font-bold text-slate-800">{po.po_number}</td>
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-slate-800">{po.supplier?.name}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">{po.supplier?.company_name || 'Personal'}</p>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-xs text-slate-500">{formatDate(po.order_date)}</td>
                                            <td className="py-4 px-6 font-semibold text-xs text-slate-500">{formatDate(po.expected_delivery_date)}</td>
                                            <td className="py-4 px-6 font-bold text-slate-800 text-right">{fmt(po.grand_total)}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${poStatus.bg} ${poStatus.text}`}>
                                                    {poStatus.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center space-x-1.5">
                                                    <button
                                                        onClick={() => handleOpenDetail(po.id)}
                                                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                                        title="Lihat Detail"
                                                    >
                                                        Detail
                                                    </button>
                                                    {po.status === 'draft' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenEditMode(po)}
                                                                className="p-1 bg-red-50 text-red-650 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                                                title="Edit PO"
                                                            >
                                                                <Edit size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePO(po.id)}
                                                                className="p-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                                title="Hapus PO"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {po.status === 'ordered' && (
                                                        <button
                                                            onClick={() => handleOpenDetail(po.id)}
                                                            className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition cursor-pointer animate-pulse"
                                                            title="Terima Barang"
                                                        >
                                                            Terima
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && pagination.total > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
                    <div>
                        Menampilkan {pagination.from || 0} sampai {pagination.to || 0} dari {pagination.total || 0} Purchase Order
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
        </div>
    );
}
