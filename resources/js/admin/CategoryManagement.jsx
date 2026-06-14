import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FolderTree, Plus, Pencil, Trash2, ChevronRight, ChevronDown, Search, X, Check, AlertCircle, Loader2, FolderOpen, Folder } from 'lucide-react';

function LoadingSpinner({ size = 5 }) {
    return <Loader2 className={`w-${size} h-${size} animate-spin text-red-500`} />;
}

function Alert({ type, msg }) {
    if (!msg) return null;
    const cfg = {
        success: 'bg-green-50 border-green-200 text-green-700',
        error:   'bg-red-50 border-red-200 text-red-700',
    };
    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${cfg[type]}`}>
            {type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            {msg}
        </div>
    );
}

// ─── Category Form Modal ──────────────────────────────────────────────────────
function CategoryModal({ category, allCategories, onSave, onClose }) {
    const isEdit = !!category;
    const [form, setForm] = useState({
        name: category?.name ?? '',
        parent_id: category?.parent_id ?? '',
        slug: category?.slug ?? '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter out self and descendants from parent options
    const parentOptions = allCategories.filter(c => c.id !== category?.id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const payload = {
                name: form.name,
                parent_id: form.parent_id || null,
                slug: form.slug || undefined,
            };
            if (isEdit) {
                await axios.put(`/adminv1/api/categories/${category.id}`, payload);
            } else {
                await axios.post('/adminv1/api/categories', payload);
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Gagal menyimpan kategori.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-5 border-b flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <FolderTree size={18} className="text-red-500" />
                        {isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <Alert type="error" msg={error} />}

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kategori *</label>
                        <input
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required placeholder="contoh: Oli Mesin"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Kategori Induk (Parent)</label>
                        <select
                            value={form.parent_id}
                            onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-white"
                        >
                            <option value="">— Tanpa Parent (Kategori Utama) —</option>
                            {parentOptions.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.parent_name ? `${c.parent_name} › ${c.name}` : c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Slug (opsional, auto-generate)</label>
                        <input
                            value={form.slug}
                            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                            placeholder="misal: oli-mesin"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 font-mono"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                            {loading ? <LoadingSpinner size={4} /> : <Check size={15} />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNode({ node, onEdit, onDelete, depth = 0 }) {
    const [open, setOpen] = useState(depth === 0);
    const hasChildren = node.children?.length > 0;
    const Icon = open && hasChildren ? FolderOpen : hasChildren ? Folder : FolderTree;

    return (
        <div>
            <div className={`flex items-center justify-between group rounded-xl px-3 py-2.5 hover:bg-slate-50 transition ${depth === 0 ? 'bg-white border border-slate-100 shadow-sm' : ''}`}
                style={{ marginLeft: depth * 20 }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasChildren && (
                        <button onClick={() => setOpen(o => !o)} className="p-0.5 text-slate-400 hover:text-slate-600 rounded">
                            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                    )}
                    {!hasChildren && <div className="w-5" />}
                    <Icon size={16} className={depth === 0 ? 'text-red-500' : 'text-slate-400'} />
                    <span className={`text-sm font-semibold truncate ${depth === 0 ? 'text-slate-800' : 'text-slate-600'}`}>{node.name}</span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">/{node.slug}</span>
                    {node.products_count > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold shrink-0">{node.products_count} produk</span>
                    )}
                    {node.children?.length > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold shrink-0">{node.children.length} sub</span>
                    )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={() => onEdit(node)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Pencil size={13} /></button>
                    <button onClick={() => onDelete(node)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus"><Trash2 size={13} /></button>
                </div>
            </div>

            {open && hasChildren && (
                <div className="mt-1 space-y-1">
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CategoryManagement() {
    const [tree, setTree] = useState([]);
    const [flatList, setFlatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [msg, setMsg] = useState(null);
    const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', category?: obj }

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [treeRes, listRes] = await Promise.all([
                axios.get('/adminv1/api/categories/tree-full'),
                axios.get('/adminv1/api/categories'),
            ]);
            setTree(treeRes.data.tree || []);
            setFlatList(listRes.data.categories || []);
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = () => {
        setModal(null);
        setMsg({ type: 'success', text: 'Kategori berhasil disimpan.' });
        fetchData();
        setTimeout(() => setMsg(null), 3000);
    };

    const handleDelete = async (cat) => {
        if (!confirm(`Hapus kategori "${cat.name}"? Pastikan tidak ada produk dan sub-kategori di dalamnya.`)) return;
        try {
            await axios.delete(`/adminv1/api/categories/${cat.id}`);
            setMsg({ type: 'success', text: 'Kategori berhasil dihapus.' });
            fetchData();
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal menghapus kategori.' });
        }
        setTimeout(() => setMsg(null), 4000);
    };

    // Filter tree by search
    const filterTree = (nodes, q) => {
        if (!q) return nodes;
        return nodes.reduce((acc, node) => {
            const childMatch = filterTree(node.children || [], q);
            if (node.name.toLowerCase().includes(q.toLowerCase()) || childMatch.length > 0) {
                acc.push({ ...node, children: childMatch });
            }
            return acc;
        }, []);
    };

    const displayTree = filterTree(tree, search);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2"><FolderTree className="text-red-500" size={22} />Manajemen Kategori</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Kelola struktur kategori produk (hierarki parent–child)</p>
                </div>
                <button onClick={() => setModal({ mode: 'create' })} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/20">
                    <Plus size={16} /> Tambah Kategori
                </button>
            </div>

            {msg && <Alert type={msg.type} msg={msg.text} />}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total Kategori', value: flatList.length, color: 'text-slate-800' },
                    { label: 'Kategori Utama', value: flatList.filter(c => !c.parent_id).length, color: 'text-blue-600' },
                    { label: 'Sub-Kategori', value: flatList.filter(c => c.parent_id).length, color: 'text-violet-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                        <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama kategori..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={15} /></button>}
            </div>

            {/* Tree View */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><LoadingSpinner size={8} /></div>
            ) : displayTree.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <FolderTree size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-semibold">{search ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}</p>
                    <p className="text-slate-400 text-sm mt-1">Klik tombol "Tambah Kategori" untuk mulai.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {displayTree.map(node => (
                        <TreeNode key={node.id} node={node} onEdit={cat => setModal({ mode: 'edit', category: cat })} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {modal && (
                <CategoryModal
                    category={modal.mode === 'edit' ? flatList.find(c => c.id === modal.category.id) : null}
                    allCategories={flatList}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
