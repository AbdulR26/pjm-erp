import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Tag, Search, Plus, Trash2, X, Check, AlertCircle,
    Loader2, ChevronDown, Package, RefreshCw, Save
} from 'lucide-react';

function Spinner({ size = 4 }) {
    return <Loader2 className={`w-${size} h-${size} animate-spin`} />;
}

// ─── Single Attribute Row ─────────────────────────────────────────────────────
// Setiap baris langsung PUT ke API saat blur / Enter, dan DELETE saat hapus
function AttrRow({ productId, attrKey, attrValue, allKeys, onDeleted, onUpdated }) {
    const [key, setKey]     = useState(attrKey);
    const [val, setVal]     = useState(attrValue);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dirty, setDirty] = useState(false);

    const save = useCallback(async () => {
        if (!key.trim() || !val.trim()) return;
        if (!dirty) return;
        setSaving(true);
        try {
            await axios.post(`/adminv1/api/products/${productId}/attributes/upsert`, {
                key: key.trim(),
                value: val.trim(),
            });
            // If key changed, delete the old one
            if (key.trim() !== attrKey) {
                await axios.delete(`/adminv1/api/products/${productId}/attributes/${encodeURIComponent(attrKey)}`);
            }
            setDirty(false);
            onUpdated?.();
        } catch (e) {
            console.error('gagal simpan atribut', e);
        } finally {
            setSaving(false);
        }
    }, [key, val, dirty, attrKey, productId, onUpdated]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/adminv1/api/products/${productId}/attributes/${encodeURIComponent(attrKey)}`);
            onDeleted?.();
        } catch (e) {
            console.error('gagal hapus atribut', e);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2 group">
            {/* Key */}
            <div className="relative w-36 shrink-0">
                <input
                    list={`attr-keys-${productId}`}
                    value={key}
                    onChange={e => { setKey(e.target.value); setDirty(true); }}
                    onBlur={save}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:border-blue-400 bg-slate-50"
                />
            </div>

            <span className="text-slate-300 text-sm shrink-0">:</span>

            {/* Value */}
            <input
                value={val}
                onChange={e => { setVal(e.target.value); setDirty(true); }}
                onBlur={save}
                onKeyDown={e => e.key === 'Enter' && save()}
                className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-red-400"
            />

            {/* Status icon */}
            <div className="w-6 shrink-0 flex items-center justify-center">
                {saving && <Spinner size={3} />}
                {!saving && dirty && (
                    <button onClick={save} className="text-blue-400 hover:text-blue-600" title="Simpan"><Save size={13} /></button>
                )}
                {!saving && !dirty && (
                    <Check size={13} className="text-green-400 opacity-0 group-hover:opacity-100 transition" />
                )}
            </div>

            {/* Delete */}
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 rounded-lg transition"
                title="Hapus atribut"
            >
                {deleting ? <Spinner size={3} /> : <Trash2 size={13} />}
            </button>
        </div>
    );
}

// ─── Add New Attribute Form ───────────────────────────────────────────────────
function AddAttrForm({ productId, allKeys, onAdded }) {
    const [key, setKey]     = useState('');
    const [val, setVal]     = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const keyRef = useRef();

    const handleAdd = async (e) => {
        e?.preventDefault();
        if (!key.trim()) { setError('Nama atribut harus diisi.'); return; }
        if (!val.trim()) { setError('Nilai atribut harus diisi.'); return; }
        setError('');
        setSaving(true);
        try {
            await axios.post(`/adminv1/api/products/${productId}/attributes/upsert`, {
                key: key.trim(),
                value: val.trim(),
            });
            setKey('');
            setVal('');
            onAdded?.();
            keyRef.current?.focus();
        } catch (e) {
            setError(e.response?.data?.message || e.response?.data?.errors?.key?.[0] || 'Gagal menambah atribut.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleAdd} className="space-y-2">
            {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle size={12} />{error}
                </div>
            )}
            <div className="flex items-center gap-2">
                {/* Key input with datalist autocomplete */}
                <div className="relative w-36 shrink-0">
                    <input
                        ref={keyRef}
                        list={`attr-keys-${productId}`}
                        value={key}
                        onChange={e => { setKey(e.target.value); setError(''); }}
                        placeholder="nama atribut"
                        className="w-full border-2 border-dashed border-slate-300 hover:border-red-300 focus:border-red-400 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-600 focus:outline-none bg-white placeholder:text-slate-400"
                    />
                    <datalist id={`attr-keys-${productId}`}>
                        {allKeys.map(k => <option key={k} value={k} />)}
                    </datalist>
                </div>

                <span className="text-slate-300 text-sm shrink-0">:</span>

                <input
                    value={val}
                    onChange={e => { setVal(e.target.value); setError(''); }}
                    placeholder="nilai"
                    className="flex-1 border-2 border-dashed border-slate-300 hover:border-red-300 focus:border-red-400 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 focus:outline-none bg-white placeholder:text-slate-400"
                />

                <button
                    type="submit"
                    disabled={saving || !key.trim() || !val.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                    {saving ? <Spinner size={3} /> : <Plus size={13} />}
                    Tambah
                </button>
            </div>
        </form>
    );
}

// ─── Attribute Editor per Product ─────────────────────────────────────────────
function AttributeEditor({ product, allKeys, onChanged }) {
    const [attrs, setAttrs] = useState(
        product.attributes && typeof product.attributes === 'object' && !Array.isArray(product.attributes)
            ? product.attributes
            : {}
    );
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/adminv1/api/products/${product.id}/attributes`);
            setAttrs(res.data.attributes || {});
            onChanged?.();
        } catch {}
        setLoading(false);
    }, [product.id, onChanged]);

    const attrEntries = Object.entries(attrs);

    return (
        <div className="px-5 py-4 space-y-3">
            {loading && (
                <div className="flex justify-center py-3"><Spinner size={5} /></div>
            )}

            {!loading && attrEntries.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2 italic">Belum ada atribut. Tambah di bawah.</p>
            )}

            {/* Existing attribute rows */}
            {!loading && attrEntries.map(([k, v]) => (
                <AttrRow
                    key={k}
                    productId={product.id}
                    attrKey={k}
                    attrValue={v}
                    allKeys={allKeys}
                    onDeleted={refresh}
                    onUpdated={refresh}
                />
            ))}

            {/* Separator */}
            <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Plus size={11} /> Tambah Atribut Baru
                </p>
                <AddAttrForm
                    productId={product.id}
                    allKeys={allKeys}
                    onAdded={refresh}
                />
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttributeManagement() {
    const [products, setProducts]       = useState([]);
    const [allKeys, setAllKeys]         = useState([]);
    const [loading, setLoading]         = useState(false);
    const [search, setSearch]           = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, kRes] = await Promise.all([
                axios.get('/adminv1/api/products'),
                axios.get('/adminv1/api/attributes/keys'),
            ]);
            setProducts(pRes.data.products || []);
            setAllKeys(kRes.data.keys || []);
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Refresh just the keys list (after adding attributes)
    const refreshKeys = useCallback(async () => {
        try {
            const res = await axios.get('/adminv1/api/attributes/keys');
            setAllKeys(res.data.keys || []);
        } catch {}
    }, []);

    const filtered = products.filter(p =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        Object.keys(
            p.attributes && typeof p.attributes === 'object' && !Array.isArray(p.attributes)
                ? p.attributes : {}
        ).some(k => k.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleExpand = (id) => setExpandedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Tag className="text-red-500" size={22} />Atribut Produk
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Tambah / edit / hapus atribut spesifikasi per produk
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Key suggestions */}
            {allKeys.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-600 mb-1.5 flex items-center gap-1">
                        <Tag size={11} /> Nama atribut yang sudah pernah dipakai (klik untuk isi):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {allKeys.map(k => (
                            <span key={k} className="px-2.5 py-0.5 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-mono font-semibold cursor-default">{k}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + expand controls */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama produk..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setExpandedIds(new Set(filtered.map(p => p.id)))}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                >
                    Buka Semua
                </button>
                <button
                    onClick={() => setExpandedIds(new Set())}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                >
                    Tutup Semua
                </button>
            </div>

            {/* Product list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Spinner size={8} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <Tag size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-semibold">Tidak ada produk ditemukan</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(product => {
                        const isOpen = expandedIds.has(product.id);
                        const attrCount = product.attributes &&
                            typeof product.attributes === 'object' &&
                            !Array.isArray(product.attributes)
                            ? Object.keys(product.attributes).length
                            : 0;

                        return (
                            <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                {/* Clickable header */}
                                <button
                                    onClick={() => toggleExpand(product.id)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Package size={16} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{product.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {product.category_path?.join(' › ') || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {attrCount > 0 ? (
                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                                                {attrCount} atribut
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-xs font-semibold">
                                                Belum ada atribut
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </button>

                                {/* Editor — only rendered when open */}
                                {isOpen && (
                                    <div className="border-t border-slate-100">
                                        <AttributeEditor
                                            product={product}
                                            allKeys={allKeys}
                                            onChanged={refreshKeys}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
