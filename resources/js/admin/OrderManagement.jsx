import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    ShoppingCart, Search, RefreshCw, Plus, X, ChevronDown, ChevronRight,
    CreditCard, Truck, Package, CheckCircle, XCircle, Clock, AlertCircle,
    Eye, Send, Ban, RotateCcw, Loader2, MapPin, Phone, User, FileText,
    ArrowRight, ExternalLink, Copy, Check, Zap, Printer
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
    { id: 'all',         label: 'Semua Order',    color: 'slate' },
    { id: 'pending',     label: 'Menunggu',        color: 'amber' },
    { id: 'processing',  label: 'Diproses',        color: 'blue' },
    { id: 'shipping',    label: 'Dikirim',         color: 'violet' },
    { id: 'completed',   label: 'Selesai',         color: 'green' },
    { id: 'cancelled',   label: 'Dibatalkan',      color: 'red' },
    { id: 'failed',      label: 'Gagal',           color: 'rose' },
];

const PAYMENT_METHODS = {
    bank_transfer: 'Transfer Bank',
    credit_card:   'Kartu Kredit/Debit',
    gopay:         'GoPay',
    qris:          'QRIS',
    shopeepay:     'ShopeePay',
    ovo:           'OVO',
    indomaret:     'Indomaret',
    alfamart:      'Alfamart',
};

const PAYMENT_STATUS_CONFIG = {
    waiting_payment: { label: 'Menunggu Bayar',  bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock },
    pending:         { label: 'Menunggu',         bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock },
    paid:            { label: 'Lunas',            bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle },
    expired:         { label: 'Kedaluwarsa',      bg: 'bg-slate-100',  text: 'text-slate-600',  icon: XCircle },
    cancelled:       { label: 'Dibatalkan',       bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
    failed:          { label: 'Gagal',            bg: 'bg-rose-100',   text: 'text-rose-700',   icon: AlertCircle },
    refunded:        { label: 'Direfund',         bg: 'bg-purple-100', text: 'text-purple-700', icon: RotateCcw },
};

const SHIPMENT_STATUS_CONFIG = {
    draft:             { label: 'Belum Booking',     bg: 'bg-slate-100',   text: 'text-slate-600' },
    pickup_requested:  { label: 'Dijadwalkan Pickup', bg: 'bg-amber-100',  text: 'text-amber-700' },
    picking_up:        { label: 'Dalam Penjemputan', bg: 'bg-yellow-100',  text: 'text-yellow-700' },
    picked:            { label: 'Barang Dijemput',   bg: 'bg-blue-100',    text: 'text-blue-700' },
    dropping_off:      { label: 'Menuju Kurir',      bg: 'bg-indigo-100',  text: 'text-indigo-700' },
    in_transit:        { label: 'Dalam Perjalanan',  bg: 'bg-violet-100',  text: 'text-violet-700' },
    delivered:         { label: 'Terkirim ✓',        bg: 'bg-green-100',   text: 'text-green-700' },
    returned:          { label: 'Dikembalikan',      bg: 'bg-orange-100',  text: 'text-orange-700' },
    cancelled:         { label: 'Dibatalkan',        bg: 'bg-red-100',     text: 'text-red-700' },
    on_hold:           { label: 'Ditahan',           bg: 'bg-gray-100',    text: 'text-gray-600' },
};

const ORDER_STATUS_CONFIG = {
    pending:    { label: 'Menunggu',   bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800' },
    processing: { label: 'Diproses',   bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800' },
    shipping:   { label: 'Dikirim',    bg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-800' },
    completed:  { label: 'Selesai',    bg: 'bg-green-50',   border: 'border-green-200',  badge: 'bg-green-100 text-green-800' },
    cancelled:  { label: 'Dibatalkan', bg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-800' },
    failed:     { label: 'Gagal',      bg: 'bg-rose-50',    border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-800' },
};

const CUSTOMER_LEVELS = ['retail', 'bengkel', 'reseller'];

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

// ─── Helper Components ────────────────────────────────────────────────────────
function Badge({ status, config }) {
    const c = config[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
}

function LoadingSpinner({ size = 5 }) {
    return <Loader2 className={`w-${size} h-${size} animate-spin text-red-500`} />;
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="p-1 text-slate-400 hover:text-slate-700 rounded transition" title="Salin">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    );
}

// ─── Create Order Modal ───────────────────────────────────────────────────────
function CreateOrderModal({ onClose, onCreated }) {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ customer_id: '', customer_level: 'retail', notes: '', items: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchProduct, setSearchProduct] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);

    useEffect(() => {
        axios.get('/adminv1/api/customers?per_page=200').then(r => setCustomers(r.data.data || []));
        axios.get('/adminv1/api/products?per_page=200').then(r => setProducts(r.data.data || []));
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.variants?.some(v => v.sku?.toLowerCase().includes(searchProduct.toLowerCase()))
    );

    const addItem = (variant, product) => {
        const exists = form.items.find(i => i.product_variant_id === variant.id);
        if (exists) {
            setForm(f => ({ ...f, items: f.items.map(i => i.product_variant_id === variant.id ? { ...i, quantity: i.quantity + 1 } : i) }));
        } else {
            setForm(f => ({ ...f, items: [...f.items, { product_variant_id: variant.id, product_name: product.name, variant_name: variant.name, sku: variant.sku, quantity: 1, stock: variant.stock }] }));
        }
        setShowProductSearch(false);
        setSearchProduct('');
    };

    const removeItem = (variantId) => setForm(f => ({ ...f, items: f.items.filter(i => i.product_variant_id !== variantId) }));
    const updateQty = (variantId, qty) => setForm(f => ({ ...f, items: f.items.map(i => i.product_variant_id === variantId ? { ...i, quantity: Math.max(1, Math.min(i.stock, Number(qty))) } : i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.customer_id) return setError('Pilih customer terlebih dahulu.');
        if (form.items.length === 0) return setError('Tambahkan minimal 1 produk.');
        setLoading(true);
        try {
            await axios.post('/adminv1/api/orders', { ...form, items: form.items.map(i => ({ product_variant_id: i.product_variant_id, quantity: i.quantity })) });
            onCreated();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Plus size={20} className="text-red-500" /> Buat Order Baru</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="p-5 overflow-y-auto space-y-4">
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Customer *</label>
                                <select value={form.customer_id} onChange={e => setForm(f => ({...f, customer_id: e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white">
                                    <option value="">-- Pilih Customer --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Level Harga *</label>
                                <select value={form.customer_level} onChange={e => setForm(f => ({...f, customer_level: e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white capitalize">
                                    {CUSTOMER_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Product Search */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Tambah Produk</label>
                            <div className="relative">
                                <input value={searchProduct} onChange={e => { setSearchProduct(e.target.value); setShowProductSearch(true); }}
                                    onFocus={() => setShowProductSearch(true)} placeholder="Cari nama produk atau SKU..." 
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm pl-9 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                {showProductSearch && searchProduct && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-56 overflow-y-auto">
                                        {filteredProducts.length === 0 ? <p className="p-3 text-sm text-slate-500 text-center">Produk tidak ditemukan</p> :
                                            filteredProducts.map(p => p.variants?.map(v => (
                                                <button type="button" key={v.id} onClick={() => addItem(v, p)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{p.name} <span className="text-slate-500">- {v.name}</span></p>
                                                        <p className="text-xs text-slate-400">SKU: {v.sku} • Stok: {v.stock}</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-red-600 shrink-0 ml-3">{fmt(v.base_price)}</p>
                                                </button>
                                            )))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        {form.items.length > 0 && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Item Order ({form.items.length})</p>
                                </div>
                                {form.items.map(item => (
                                    <div key={item.product_variant_id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-800">{item.product_name}</p>
                                            <p className="text-xs text-slate-500">{item.variant_name} · {item.sku}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => updateQty(item.product_variant_id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 font-bold flex items-center justify-center transition text-sm">-</button>
                                            <input type="number" value={item.quantity} onChange={e => updateQty(item.product_variant_id, e.target.value)} className="w-12 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 focus:outline-none focus:border-red-400" min="1" max={item.stock} />
                                            <button type="button" onClick={() => updateQty(item.product_variant_id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600 font-bold flex items-center justify-center transition text-sm">+</button>
                                        </div>
                                        <button type="button" onClick={() => removeItem(item.product_variant_id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={15} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Catatan (opsional)</label>
                            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none" placeholder="Catatan khusus untuk order ini..." />
                        </div>
                    </div>
                    <div className="p-5 border-t bg-slate-50 shrink-0 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-2 py-2.5 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                            {loading ? <LoadingSpinner size={4} /> : <ShoppingCart size={16} />} Buat Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────
function PaymentTab({ order }) {
    const [payment, setPayment] = useState(order.payment);
    const [loading, setLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [msg, setMsg] = useState(null);

    const refreshPayment = useCallback(async (sync = false) => {
        try {
            const res = await axios.get(`/adminv1/api/orders/${order.id}/payment${sync ? '?sync=1' : ''}`);
            setPayment(res.data);
        } catch {/* payment not yet created */}
    }, [order.id]);

    const handleCreatePayment = async () => {
        setLoading(true); setMsg(null);
        try {
            const res = await axios.post(`/adminv1/api/orders/${order.id}/payment`, { payment_method: selectedMethod || null });
            setPayment(res.data.payment);
            setMsg({ type: 'success', text: 'Snap token berhasil dibuat! Salin link bayar untuk dikirim ke customer.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Gagal membuat payment.' });
        } finally { setLoading(false); }
    };

    const handleSync = async () => {
        setSyncLoading(true);
        await refreshPayment(true);
        setSyncLoading(false);
        setMsg({ type: 'success', text: 'Status berhasil disinkronkan dari Midtrans.' });
    };

    const handleCancel = async () => {
        if (!confirm('Batalkan payment ini?')) return;
        setCancelLoading(true); setMsg(null);
        try {
            const res = await axios.post(`/adminv1/api/orders/${order.id}/payment/cancel`);
            setPayment(res.data.payment);
            setMsg({ type: 'success', text: 'Payment berhasil dibatalkan.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Gagal membatalkan payment.' });
        } finally { setCancelLoading(false); }
    };

    const pStatus = PAYMENT_STATUS_CONFIG[payment?.status] || PAYMENT_STATUS_CONFIG['pending'];
    const PIcon = pStatus.icon;

    return (
        <div className="space-y-4">
            {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}{msg.text}</div>}

            {payment ? (
                <>
                    {/* Payment Summary Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><CreditCard size={20} className="text-blue-600" /></div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Detail Pembayaran</p>
                                    <p className="text-xs text-slate-500">#{payment.id} · {formatDate(payment.created_at)}</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${pStatus.bg} ${pStatus.text}`}>
                                <PIcon size={12} />{pStatus.label}
                            </span>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-4">
                            <InfoRow label="Jumlah" value={fmt(payment.amount)} highlight />
                            <InfoRow label="Metode" value={PAYMENT_METHODS[payment.payment_method] || payment.payment_method || 'Belum dipilih'} />
                            <InfoRow label="Midtrans TxID" value={payment.midtrans_transaction_id || '-'} />
                            <InfoRow label="VA Number" value={payment.midtrans_va_number || '-'} />
                            <InfoRow label="Bayar Pada" value={formatDate(payment.paid_at)} />
                            <InfoRow label="Kedaluwarsa" value={formatDate(payment.expired_at)} />
                        </div>

                        {payment.payment_url && (
                            <div className="px-5 pb-5">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Link Pembayaran (Midtrans Snap)</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                    <p className="text-xs text-slate-600 flex-1 truncate font-mono">{payment.payment_url}</p>
                                    <CopyButton text={payment.payment_url} />
                                    <a href={payment.payment_url} target="_blank" rel="noreferrer" className="p-1 text-blue-500 hover:text-blue-700 transition"><ExternalLink size={14} /></a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={handleSync} disabled={syncLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition border border-blue-200">
                            {syncLoading ? <LoadingSpinner size={4} /> : <RefreshCw size={14} />} Sync Status
                        </button>
                        {payment.status !== 'paid' && payment.status !== 'refunded' && (
                            <button onClick={handleCancel} disabled={cancelLoading} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-bold transition border border-red-200">
                                {cancelLoading ? <LoadingSpinner size={4} /> : <Ban size={14} />} Batalkan
                            </button>
                        )}
                    </div>
                </>
            ) : (
                /* Create Payment Form */
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Zap size={20} className="text-amber-500" /></div>
                        <div>
                            <p className="text-sm font-black text-slate-800">Buat Pembayaran</p>
                            <p className="text-xs text-slate-500">Generate Snap token Midtrans untuk order ini</p>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Metode Pembayaran (Opsional)</label>
                        <select value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-white">
                            <option value="">Semua Metode (Pilih di Snap)</option>
                            {Object.entries(PAYMENT_METHODS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
                        <AlertCircle size={15} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">Snap token akan digenerate dari Midtrans. Salin link bayar dan kirimkan ke customer, atau buka langsung untuk test pembayaran.</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Total yang harus dibayar:</p>
                        <p className="text-xl font-black text-slate-800">{fmt(order.grand_total)}</p>
                    </div>

                    <button onClick={handleCreatePayment} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition">
                        {loading ? <LoadingSpinner size={4} /> : <CreditCard size={16} />} Generate Link Pembayaran Midtrans
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Shipment Tab ─────────────────────────────────────────────────────────────
function ShipmentTab({ order }) {
    const [shipment, setShipment] = useState(order.shipment);
    const [rates, setRates] = useState([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [selectedRate, setSelectedRate] = useState(null);
    const [step, setStep] = useState('address'); // address | rates | confirm

    const customer = order.customer;
    const [form, setForm] = useState({
        destination_contact_name: customer?.name || '',
        destination_contact_phone: customer?.phone || '',
        destination_address: customer?.address || '',
        destination_postal_code: '',
        destination_latitude: '',
        destination_longitude: '',
        couriers: 'jne,jnt,sicepat,anteraja,ide',
    });

    const canCreateShipment = order.payment?.status === 'paid' || !order.payment;

    const handleGetRates = async (e) => {
        e.preventDefault();
        if (!form.destination_postal_code) { setMsg({ type: 'error', text: 'Kode pos tujuan harus diisi.' }); return; }
        setLoadingRates(true); setMsg(null); setRates([]);
        try {
            const res = await axios.get(`/adminv1/api/orders/${order.id}/shipment/rates`, {
                params: { destination_postal_code: form.destination_postal_code, destination_latitude: form.destination_latitude || undefined, destination_longitude: form.destination_longitude || undefined, couriers: form.couriers }
            });
            setRates(res.data.rates || []);
            setStep('rates');
            if (!res.data.rates?.length) setMsg({ type: 'error', text: 'Tidak ada layanan pengiriman yang tersedia untuk area ini.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Gagal mendapatkan ongkir.' });
        } finally { setLoadingRates(false); }
    };

    const handleCreateShipment = async () => {
        if (!selectedRate) return;
        setLoadingCreate(true); setMsg(null);
        try {
            const res = await axios.post(`/adminv1/api/orders/${order.id}/shipment`, {
                courier_company: selectedRate.courier_code,
                courier_service: selectedRate.courier_service_code,
                courier_service_name: `${selectedRate.courier_name} ${selectedRate.courier_service_name}`,
                etd: selectedRate.duration,
                cost: selectedRate.price,
                ...form,
            });
            setShipment(res.data.shipment);
            setMsg({ type: 'success', text: 'Pengiriman berhasil dibooking! Kurir akan melakukan pickup.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Gagal membuat pengiriman.' });
        } finally { setLoadingCreate(false); }
    };

    const handleSync = async () => {
        setSyncLoading(true);
        try {
            const res = await axios.get(`/adminv1/api/orders/${order.id}/shipment?sync=1`);
            setShipment(res.data);
            setMsg({ type: 'success', text: 'Status tracking berhasil disinkronkan.' });
        } catch { }
        setSyncLoading(false);
    };

    const handleCancel = async () => {
        const reason = prompt('Alasan pembatalan pengiriman:');
        if (!reason) return;
        setCancelLoading(true); setMsg(null);
        try {
            const res = await axios.post(`/adminv1/api/orders/${order.id}/shipment/cancel`, { reason });
            setShipment(res.data.shipment);
            setMsg({ type: 'success', text: 'Pengiriman berhasil dibatalkan.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Gagal membatalkan pengiriman.' });
        } finally { setCancelLoading(false); }
    };

    if (shipment && shipment.status !== 'cancelled') {
        const sStatus = SHIPMENT_STATUS_CONFIG[shipment.status] || SHIPMENT_STATUS_CONFIG['draft'];
        return (
            <div className="space-y-4">
                {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}{msg.text}</div>}

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center"><Truck size={20} className="text-violet-600" /></div>
                            <div>
                                <p className="text-sm font-black text-slate-800">{shipment.courier_service_name || `${shipment.courier_company.toUpperCase()} ${shipment.courier_service.toUpperCase()}`}</p>
                                <p className="text-xs text-slate-500">ETD: {shipment.etd || '-'} hari</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${sStatus.bg} ${sStatus.text}`}>{sStatus.label}</span>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4">
                        <InfoRow label="Ongkir" value={fmt(shipment.cost)} highlight />
                        <InfoRow label="Biteship Order ID" value={shipment.biteship_order_id || '-'} />
                        <InfoRow label="Nomor Resi" value={shipment.waybill_id || 'Belum tersedia'} />
                        <InfoRow label="Pickup Pada" value={formatDate(shipment.picked_at)} />
                        <InfoRow label="Dikirim Pada" value={formatDate(shipment.shipped_at)} />
                        <InfoRow label="Terkirim Pada" value={formatDate(shipment.delivered_at)} />
                    </div>

                    <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Alamat Tujuan</p>
                        <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                            <p className="text-sm font-bold text-slate-800">{shipment.destination_contact_name}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-1"><Phone size={12} />{shipment.destination_contact_phone}</p>
                            <p className="text-sm text-slate-600 flex items-start gap-1"><MapPin size={12} className="mt-0.5 shrink-0" />{shipment.destination_address}{shipment.destination_postal_code && ` (${shipment.destination_postal_code})`}</p>
                        </div>
                    </div>

                    {/* Tracking History */}
                    {shipment.tracking_history?.length > 0 && (
                        <div className="px-5 pb-5">
                            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Riwayat Tracking</p>
                            <div className="space-y-2">
                                {shipment.tracking_history.slice().reverse().map((t, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-violet-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <p className="font-semibold text-slate-700">{t.status || t.note}</p>
                                            <p className="text-xs text-slate-400">{formatDate(t.updated_at || t.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button onClick={handleSync} disabled={syncLoading} className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-sm font-bold transition border border-violet-200">
                        {syncLoading ? <LoadingSpinner size={4} /> : <RefreshCw size={14} />} Sync Tracking
                    </button>
                    {['draft', 'pickup_requested'].includes(shipment.status) && (
                        <button onClick={handleCancel} disabled={cancelLoading} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-bold transition border border-red-200">
                            {cancelLoading ? <LoadingSpinner size={4} /> : <Ban size={14} />} Batalkan
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // No active shipment — show creation form
    return (
        <div className="space-y-4">
            {msg && <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}{msg.text}</div>}

            {!canCreateShipment && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">Order harus sudah dibayar lunas sebelum membuat pengiriman. Pergi ke tab <strong>Payment</strong> terlebih dahulu.</p>
                </div>
            )}

            {step === 'address' && (
                <form onSubmit={handleGetRates} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center"><MapPin size={20} className="text-violet-600" /></div>
                        <div>
                            <p className="text-sm font-black text-slate-800">Alamat Pengiriman</p>
                            <p className="text-xs text-slate-500">Isi alamat tujuan dan cek ongkir</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nama Penerima *</label>
                            <input value={form.destination_contact_name} onChange={e => setForm(f => ({...f, destination_contact_name: e.target.value}))} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">No. HP Penerima *</label>
                            <input value={form.destination_contact_phone} onChange={e => setForm(f => ({...f, destination_contact_phone: e.target.value}))} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap *</label>
                        <textarea value={form.destination_address} onChange={e => setForm(f => ({...f, destination_address: e.target.value}))} required rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Kode Pos *</label>
                            <input value={form.destination_postal_code} onChange={e => setForm(f => ({...f, destination_postal_code: e.target.value}))} required placeholder="12345" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Latitude</label>
                            <input value={form.destination_latitude} onChange={e => setForm(f => ({...f, destination_latitude: e.target.value}))} placeholder="-6.1234" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Longitude</label>
                            <input value={form.destination_longitude} onChange={e => setForm(f => ({...f, destination_longitude: e.target.value}))} placeholder="106.1234" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                        </div>
                    </div>
                    <button type="submit" disabled={loadingRates} className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition">
                        {loadingRates ? <LoadingSpinner size={4} /> : <Truck size={16} />} Cek Ongkos Kirim
                    </button>
                </form>
            )}

            {step === 'rates' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700">{rates.length} Layanan Pengiriman Tersedia</p>
                        <button onClick={() => { setStep('address'); setSelectedRate(null); }} className="text-xs text-violet-600 hover:underline font-semibold">← Ubah Alamat</button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {rates.map((rate, i) => (
                            <button key={i} type="button" onClick={() => setSelectedRate(rate)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition text-left ${selectedRate === rate ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}>
                                <div>
                                    <p className="text-sm font-black text-slate-800">{rate.courier_name} <span className="font-semibold text-slate-600">{rate.courier_service_name}</span></p>
                                    <p className="text-xs text-slate-500">Est. {rate.duration || '?'} hari · {rate.courier_code?.toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-black text-violet-700">{fmt(rate.price)}</p>
                                    {selectedRate === rate && <p className="text-xs text-violet-500 font-bold">✓ Dipilih</p>}
                                </div>
                            </button>
                        ))}
                    </div>
                    {selectedRate && (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                            <p className="text-sm font-bold text-violet-800 mb-1">Ringkasan Pengiriman:</p>
                            <p className="text-sm text-violet-700">{selectedRate.courier_name} - {selectedRate.courier_service_name}</p>
                            <p className="text-sm text-violet-700">Ongkir: <strong>{fmt(selectedRate.price)}</strong> · ETD: <strong>{selectedRate.duration} hari</strong></p>
                        </div>
                    )}
                    <button onClick={handleCreateShipment} disabled={!selectedRate || loadingCreate || !canCreateShipment} className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition">
                        {loadingCreate ? <LoadingSpinner size={4} /> : <Send size={16} />} Booking Kurir via Biteship
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose, onRefresh }) {
    const [activeTab, setActiveTab] = useState('detail');
    const [fullOrder, setFullOrder] = useState(order);
    const [loading, setLoading] = useState(false);

    const loadOrder = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/adminv1/api/orders/${order.id}`);
            setFullOrder(res.data);
        } catch {}
        setLoading(false);
    }, [order.id]);

    useEffect(() => { loadOrder(); }, [loadOrder]);

    const tabs = [
        { id: 'detail',   label: 'Detail Order',   icon: FileText },
        { id: 'payment',  label: 'Payment',         icon: CreditCard },
        { id: 'shipment', label: 'Pengiriman',      icon: Truck },
    ];

    const oCfg = ORDER_STATUS_CONFIG[fullOrder.status] || ORDER_STATUS_CONFIG['pending'];

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl h-full max-h-[calc(100vh-2rem)] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-5 border-b shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <ShoppingCart size={18} className="text-red-500" />
                                {fullOrder.order_number}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(fullOrder.created_at)} · {fullOrder.customer?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${oCfg.badge}`}>{oCfg.label}</span>
                            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={18} /></button>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        {tabs.map(t => {
                            const TIcon = t.icon;
                            return (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${activeTab === t.id ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <TIcon size={13} />{t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex items-center justify-center h-32"><LoadingSpinner size={7} /></div>
                    ) : (
                        <>
                            {activeTab === 'detail' && <DetailTab order={fullOrder} />}
                            {activeTab === 'payment' && <PaymentTab order={fullOrder} />}
                            {activeTab === 'shipment' && <ShipmentTab order={fullOrder} />}
                        </>
                    )}
                </div>

                <div className="p-4 border-t shrink-0 flex flex-col sm:flex-row gap-2">
                    <button onClick={() => { loadOrder(); onRefresh(); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition border border-slate-200">
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                    <a href={`/adminv1/api/orders/${fullOrder.id}/print-invoice`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold bg-red-650 hover:bg-red-700 text-white rounded-xl transition text-center shadow-md shadow-red-500/10">
                        <Printer size={14} /> Cetak Invoice
                    </a>
                    {fullOrder.shipment && (
                        <a href={`/adminv1/api/orders/${fullOrder.id}/print-resi`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-750 text-white rounded-xl transition text-center shadow-md shadow-violet-500/10">
                            <Printer size={14} /> Cetak Resi
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailTab({ order }) {
    const oCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['pending'];
    return (
        <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1"><User size={12} /> Informasi Customer</p>
                <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Nama" value={order.customer?.name || '-'} />
                    <InfoRow label="Telepon" value={order.customer?.phone || '-'} />
                    <InfoRow label="Email" value={order.customer?.email || '-'} />
                    <InfoRow label="Level Harga" value={<span className="capitalize font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs">{order.customer_level}</span>} />
                </div>
                {order.customer?.address && <p className="text-xs text-slate-500 mt-2 flex items-start gap-1"><MapPin size={11} className="mt-0.5 shrink-0" />{order.customer.address}</p>}
            </div>

            {/* Order Items */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Package size={12} /> Item Order ({order.items?.length || 0})</p>
                </div>
                {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{item.product_name}</p>
                            <p className="text-xs text-slate-500">{item.variant_name} · {item.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{fmt(item.total_price)}</p>
                            <p className="text-xs text-slate-400">{item.quantity}x {fmt(item.unit_price)}</p>
                        </div>
                    </div>
                ))}
                {/* Pricing Summary */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal</span><span className="font-semibold">{fmt(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Diskon</span><span className="font-semibold">-{fmt(order.discount)}</span></div>}
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Ongkos Kirim</span><span className="font-semibold">{fmt(order.shipping_cost)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-800 pt-1.5 border-t border-slate-200">
                        <span>Total</span><span className="text-red-600">{fmt(order.grand_total)}</span>
                    </div>
                </div>
            </div>

            {order.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wide">Catatan</p>
                    <p className="text-sm text-amber-800">{order.notes}</p>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, highlight }) {
    return (
        <div>
            <p className="text-xs text-slate-400 font-semibold mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${highlight ? 'text-red-600' : 'text-slate-700'} break-all`}>{typeof value === 'string' || typeof value === 'number' ? value : value}</p>
        </div>
    );
}

// ─── Main OrderManagement Component ──────────────────────────────────────────
export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/adminv1/api/orders', {
                params: { status: statusFilter, search: search || undefined, page, per_page: 15 }
            });
            setOrders(res.data.data || []);
            setPagination(res.data);
        } catch { }
        setLoading(false);
    }, [statusFilter, search, page]);

    useEffect(() => { setPage(1); }, [statusFilter, search]);
    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleCreated = () => { setShowCreateModal(false); fetchOrders(); };

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2"><ShoppingCart className="text-red-500" size={22} />Manajemen Order</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Kelola pesanan, pembayaran, dan pengiriman customer</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/20">
                    <Plus size={16} /> Buat Order
                </button>
            </div>

            {/* Status Tab Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {ORDER_STATUSES.map(s => (
                    <button key={s.id} onClick={() => setStatusFilter(s.id)}
                        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition ${statusFilter === s.id ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari no. order atau nama customer..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button onClick={fetchOrders} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><LoadingSpinner size={8} /></div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-semibold">Tidak ada order ditemukan</p>
                    <p className="text-slate-400 text-sm mt-1">Coba ubah filter atau buat order baru</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => {
                        const oCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['pending'];
                        const pStatus = PAYMENT_STATUS_CONFIG[order.payment?.status];
                        const sStatus = SHIPMENT_STATUS_CONFIG[order.shipment?.status];
                        return (
                            <div key={order.id} onClick={() => setSelectedOrder(order)} className={`bg-white border-2 ${oCfg.border} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-sm font-black text-slate-800">{order.order_number}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${oCfg.badge}`}>{oCfg.label}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 flex items-center gap-1.5"><User size={12} className="text-slate-400 shrink-0" />{order.customer?.name} <span className="text-slate-400">·</span> <span className="capitalize text-xs bg-slate-100 px-2 py-0.5 rounded-lg font-semibold text-slate-600">{order.customer_level}</span></p>
                                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.created_at)} · {order.items?.length || 0} item</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-base font-black text-slate-800">{fmt(order.grand_total)}</p>
                                        <ArrowRight size={14} className="text-slate-300 ml-auto mt-1" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                    {pStatus ? (
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${pStatus.bg} ${pStatus.text}`}>
                                            <CreditCard size={11} />{pStatus.label}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500"><CreditCard size={11} />Belum ada payment</span>
                                    )}
                                    {sStatus ? (
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${sStatus.bg} ${sStatus.text}`}>
                                            <Truck size={11} />{sStatus.label}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500"><Truck size={11} />Belum dikirim</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-slate-500">Halaman {pagination.current_page} dari {pagination.last_page} · {pagination.total} order</p>
                    <div className="flex gap-2">
                        <button disabled={pagination.current_page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition">← Sebelumnya</button>
                        <button disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition">Berikutnya →</button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && <CreateOrderModal onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />}
            {selectedOrder && <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} onRefresh={fetchOrders} />}
        </div>
    );
}
