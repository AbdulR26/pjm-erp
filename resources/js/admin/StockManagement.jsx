import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Warehouse, Search, Plus, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Package, X, Check, AlertCircle, Loader2, History, ArrowUpCircle, ArrowDownCircle, SlidersHorizontal } from 'lucide-react';

function LoadingSpinner({ size = 5 }) {
    return <Loader2 className={`w-${size} h-${size} animate-spin text-red-500`} />;
}

function Alert({ type, msg }) {
    if (!msg) return null;
    const cfg = { success: 'bg-green-50 border-green-200 text-green-700', error: 'bg-red-50 border-red-200 text-red-700', warning: 'bg-amber-50 border-amber-200 text-amber-700' };
    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${cfg[type]}`}>
            {type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}{msg}
        </div>
    );
}

const STOCK_STATUS_CFG = {
    Normal:  { bg: 'bg-green-100',  text: 'text-green-700' },
    Rendah:  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    Kritis:  { bg: 'bg-orange-100', text: 'text-orange-700' },
    Habis:   { bg: 'bg-red-100',    text: 'text-red-700' },
};

const SOURCE_LABELS = {
    purchase:   'Pembelian',
    sale:       'Penjualan',
    adjustment: 'Penyesuaian',
    return:     'Retur',
    damage:     'Kerusakan',
    transfer:   'Transfer Gudang',
};

const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

// ─── Mutate Modal ─────────────────────────────────────────────────────────────
function MutateModal({ variant, onSave, onClose }) {
    const [form, setForm] = useState({ type: 'in', quantity: 1, source: 'adjustment', notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await axios.post('/adminv1/api/stock/mutate', {
                product_variant_id: variant.id,
                ...form,
                quantity: Number(form.quantity),
            });
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memproses mutasi stok.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-5 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-800">Mutasi Stok</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{variant.product_name} — {variant.variant_name} (SKU: {variant.sku})</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <Alert type="error" msg={error} />}

                    {/* Stok saat ini */}
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 font-semibold">Stok Saat Ini</p>
                        <p className="text-3xl font-black text-slate-800 mt-1">{variant.stock}</p>
                    </div>

                    {/* Type toggle */}
                    <div className="grid grid-cols-2 gap-2">
                        {[{ v: 'in', label: 'Stok Masuk', icon: TrendingUp, color: 'green' }, { v: 'out', label: 'Stok Keluar', icon: TrendingDown, color: 'red' }].map(opt => {
                            const Icon = opt.icon;
                            const active = form.type === opt.v;
                            return (
                                <button key={opt.v} type="button" onClick={() => setForm(f => ({ ...f, type: opt.v }))}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition ${active ? (opt.color === 'green' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                    <Icon size={16} />{opt.label}
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah *</label>
                        <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                        {form.quantity && (
                            <p className="text-xs text-slate-500 mt-1">
                                Stok setelah: <strong className={form.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                                    {form.type === 'in' ? variant.stock + Number(form.quantity) : Math.max(0, variant.stock - Number(form.quantity))}
                                </strong>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Sumber *</label>
                        <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-white">
                            {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Catatan</label>
                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
                            placeholder="Keterangan tambahan..." />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                            {loading ? <LoadingSpinner size={4} /> : <Check size={15} />} Proses
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Correct Modal ─────────────────────────────────────────────────────────────
function CorrectModal({ variant, onSave, onClose }) {
    const [form, setForm] = useState({ stock: variant.stock, notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const diff = Number(form.stock) - variant.stock;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await axios.put(`/adminv1/api/stock/${variant.id}/correct`, { stock: Number(form.stock), notes: form.notes });
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal koreksi stok.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-5 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-800">Koreksi Stok</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{variant.product_name} — {variant.variant_name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <Alert type="error" msg={error} />}

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3">
                        <div className="text-center">
                            <p className="text-xs text-slate-500">Stok Saat Ini</p>
                            <p className="text-2xl font-black text-slate-700">{variant.stock}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500">Selisih</p>
                            <p className={`text-2xl font-black ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {diff > 0 ? `+${diff}` : diff}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Stok Aktual (Koreksi ke) *</label>
                        <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-lg font-bold text-center focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Catatan</label>
                        <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="misal: hasil stock opname"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading || diff === 0} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                            {loading ? <LoadingSpinner size={4} /> : <SlidersHorizontal size={14} />} Koreksi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Mutation History Tab ─────────────────────────────────────────────────────
function MutationHistory() {
    const [mutations, setMutations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ type: '', source: '', search: '' });

    const fetchMutations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/adminv1/api/stock/mutations', {
                params: { type: filter.type || undefined, source: filter.source || undefined, per_page: 50 }
            });
            setMutations(res.data.data?.data || []);
        } catch {}
        setLoading(false);
    }, [filter]);

    useEffect(() => { fetchMutations(); }, [fetchMutations]);

    const filtered = mutations.filter(m =>
        !filter.search ||
        m.product_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.sku?.toLowerCase().includes(filter.search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} placeholder="Cari produk / SKU..."
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400" />
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-400">
                    <option value="">Semua Tipe</option>
                    <option value="in">Masuk</option>
                    <option value="out">Keluar</option>
                </select>
                <select value={filter.source} onChange={e => setFilter(f => ({ ...f, source: e.target.value }))} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-400">
                    <option value="">Semua Sumber</option>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-10"><LoadingSpinner size={7} /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">Tidak ada riwayat mutasi.</div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(m => (
                        <div key={m.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {m.type === 'in' ? <ArrowUpCircle size={16} className="text-green-600" /> : <ArrowDownCircle size={16} className="text-red-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{m.product_name} <span className="text-slate-500 font-normal">- {m.variant_name}</span></p>
                                <p className="text-xs text-slate-400">{m.sku} · {m.source_label} · {m.created_by} · {fmtDate(m.created_at)}</p>
                                {m.notes && <p className="text-xs text-slate-500 italic mt-0.5">"{m.notes}"</p>}
                            </div>
                            <div className={`text-base font-black shrink-0 ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                {m.type === 'in' ? '+' : '-'}{m.quantity}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StockManagement() {
    const [activeTab, setActiveTab] = useState('stock');
    const [stock, setStock] = useState({ data: { data: [] }, summary: {} });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [modal, setModal] = useState(null); // { type: 'mutate'|'correct', variant }
    const [msg, setMsg] = useState(null);

    const fetchStock = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/adminv1/api/stock', {
                params: { search: search || undefined, low_stock: lowStockOnly || undefined, per_page: 50 }
            });
            setStock(res.data);
        } catch {}
        setLoading(false);
    }, [search, lowStockOnly]);

    useEffect(() => { fetchStock(); }, [fetchStock]);

    const handleSave = () => {
        setModal(null);
        setMsg({ type: 'success', text: 'Stok berhasil diperbarui.' });
        fetchStock();
        setTimeout(() => setMsg(null), 3000);
    };

    const summary = stock.summary || {};
    const variants = stock.data?.data || [];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2"><Warehouse className="text-red-500" size={22} />Manajemen Stok</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Pantau, mutasi, dan koreksi stok produk & varian</p>
                </div>
                <button onClick={fetchStock} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {msg && <Alert type={msg.type} msg={msg.text} />}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Varian', value: summary.total_variants ?? '-', icon: Package, color: 'text-slate-700', bg: 'bg-slate-50' },
                    { label: 'Stok Rendah', value: summary.low_stock ?? '-', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Stok Habis', value: summary.empty_stock ?? '-', icon: X, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Nilai Stok', value: summary.total_stock_value ? fmt(summary.total_stock_value) : '-', icon: Warehouse, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`${s.bg} border border-slate-200 rounded-2xl p-4 shadow-sm`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Icon size={15} className={s.color} />
                                <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
                            </div>
                            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {[{ id: 'stock', label: 'Stok Varian', icon: Package }, { id: 'history', label: 'Riwayat Mutasi', icon: History }].map(t => {
                    const TIcon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === t.id ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                            <TIcon size={14} />{t.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'stock' && (
                <>
                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex-1 relative min-w-48">
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk, varian, SKU..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <button
                            onClick={() => setLowStockOnly(p => !p)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition ${lowStockOnly ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}
                        >
                            <AlertTriangle size={14} /> Stok Rendah
                        </button>
                    </div>

                    {/* Stock Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><LoadingSpinner size={8} /></div>
                    ) : variants.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <Warehouse size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-semibold">Tidak ada varian ditemukan</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">Produk / Varian</th>
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">SKU</th>
                                            <th className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">Kategori</th>
                                            <th className="text-center px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">Stok</th>
                                            <th className="text-center px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">Status</th>
                                            <th className="text-right px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {variants.map(v => {
                                            const sCfg = STOCK_STATUS_CFG[v.stock_status?.label] || STOCK_STATUS_CFG['Normal'];
                                            return (
                                                <tr key={v.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-slate-800">{v.product_name}</p>
                                                        <p className="text-xs text-slate-400">{v.variant_name}</p>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.sku}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{v.category || '-'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-base font-black ${v.stock === 0 ? 'text-red-600' : v.stock <= 5 ? 'text-orange-600' : 'text-slate-800'}`}>{v.stock}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${sCfg.bg} ${sCfg.text}`}>{v.stock_status?.label}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button onClick={() => setModal({ type: 'mutate', variant: v })}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition">
                                                                <Plus size={12} /> Mutasi
                                                            </button>
                                                            <button onClick={() => setModal({ type: 'correct', variant: v })}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                                                                <SlidersHorizontal size={12} /> Koreksi
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'history' && <MutationHistory />}

            {/* Modals */}
            {modal?.type === 'mutate' && <MutateModal variant={modal.variant} onSave={handleSave} onClose={() => setModal(null)} />}
            {modal?.type === 'correct' && <CorrectModal variant={modal.variant} onSave={handleSave} onClose={() => setModal(null)} />}
        </div>
    );
}
