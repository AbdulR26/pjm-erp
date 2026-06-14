import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    Plus, Edit, Trash2, Image as ImageIcon, X, Check, Save, ArrowLeft, 
    RefreshCw, Link, UploadCloud, Trash, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

export default function BannersManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
    const [editingBanner, setEditingBanner] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    // Form inputs state
    const [formTitle, setFormTitle] = useState('');
    const [formSubtitle, setFormSubtitle] = useState('');
    const [formBadge, setFormBadge] = useState('');
    const [formButtonText, setFormButtonText] = useState('Detail');
    const [formImage, setFormImage] = useState('');
    const [formLink, setFormLink] = useState('#');
    const [formOrder, setFormOrder] = useState(0);
    const [formIsActive, setFormIsActive] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/adminv1/api/banners');
            if (res.data && res.data.banners) {
                setBanners(res.data.banners);
            }
        } catch (err) {
            console.error('Error fetching banners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleOpenCreate = () => {
        setEditingBanner(null);
        setFormTitle('');
        setFormSubtitle('');
        setFormBadge('');
        setFormButtonText('Detail');
        setFormImage('');
        setFormLink('#');
        setFormOrder(banners.length + 1);
        setFormIsActive(true);
        setViewMode('form');
    };

    const handleOpenEdit = (banner) => {
        setEditingBanner(banner);
        setFormTitle(banner.title);
        setFormSubtitle(banner.subtitle || '');
        setFormBadge(banner.badge || '');
        setFormButtonText(banner.button_text || 'Detail');
        setFormImage(banner.image);
        setFormLink(banner.link || '#');
        setFormOrder(banner.order || 0);
        setFormIsActive(!!banner.is_active);
        setViewMode('form');
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire('Format Salah', 'Berkas harus berupa gambar!', 'warning');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire('Ukuran Terlalu Besar', 'Maksimal ukuran gambar adalah 2MB!', 'warning');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/adminv1/api/banners/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.status === 'success') {
                setFormImage(res.data.url);
                showToast('Gambar banner berhasil diunggah!');
            }
        } catch (err) {
            console.error('Error uploading banner image:', err);
            Swal.fire('Error', err.response?.data?.message || 'Gagal mengunggah gambar banner.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            const updatedIsActive = !banner.is_active;
            const res = await axios.put(`/adminv1/api/banners/${banner.id}`, {
                ...banner,
                is_active: updatedIsActive
            });
            if (res.data && res.data.status === 'success') {
                showToast(`Status banner diperbarui!`);
                fetchBanners();
            }
        } catch (err) {
            console.error('Error toggling active state:', err);
            Swal.fire('Gagal', 'Gagal memperbarui status banner.', 'error');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus Banner?',
            text: 'Banner ini tidak akan ditampilkan lagi di beranda e-commerce.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`/adminv1/api/banners/${id}`);
                    if (res.data && res.data.status === 'success') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Banner berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        fetchBanners();
                    }
                } catch (err) {
                    console.error('Error deleting banner:', err);
                    Swal.fire('Gagal', 'Gagal menghapus banner.', 'error');
                }
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formTitle) {
            Swal.fire('Perhatian', 'Judul banner wajib diisi!', 'warning');
            return;
        }
        if (!formImage) {
            Swal.fire('Perhatian', 'Gambar banner wajib diunggah atau diset!', 'warning');
            return;
        }

        const payload = {
            title: formTitle,
            subtitle: formSubtitle,
            badge: formBadge,
            button_text: formButtonText,
            image: formImage,
            link: formLink,
            order: parseInt(formOrder) || 0,
            is_active: formIsActive
        };

        try {
            if (editingBanner) {
                const res = await axios.put(`/adminv1/api/banners/${editingBanner.id}`, payload);
                if (res.data && res.data.status === 'success') {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Banner berhasil diperbarui!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchBanners();
                    setViewMode('list');
                }
            } else {
                const res = await axios.post('/adminv1/api/banners', payload);
                if (res.data && res.data.status === 'success') {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Banner baru berhasil ditambahkan!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchBanners();
                    setViewMode('list');
                }
            }
        } catch (err) {
            console.error('Error saving banner:', err);
            Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data banner.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-wider">Pengaturan Slider Banner Utama</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Kelola banner promo komersial yang tayang di carousel halaman depan.</p>
                </div>
                {viewMode === 'list' && (
                    <button
                        onClick={handleOpenCreate}
                        className="bg-red-650 hover:bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-red-500/20 transition duration-200 flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto uppercase tracking-wide"
                    >
                        <Plus size={15} />
                        <span>Tambah Banner Baru</span>
                    </button>
                )}
            </div>

            {/* TOAST ALERT DISPLAY */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-slate-400 font-bold">Memuat data banner...</span>
                        </div>
                    ) : banners.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <ImageIcon size={40} className="stroke-1 mb-2.5" />
                            <p className="text-xs font-bold">Tidak ada banner terdaftar.</p>
                            <button
                                onClick={handleOpenCreate}
                                className="mt-3.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                            >
                                Buat Banner Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                        <th className="px-6 py-4 w-16 text-center">Urutan</th>
                                        <th className="px-6 py-4 w-48">Gambar Banner</th>
                                        <th className="px-6 py-4">Informasi Text Promo</th>
                                        <th className="px-6 py-4 w-44">Navigasi Tombol</th>
                                        <th className="px-6 py-4 w-28 text-center">Status</th>
                                        <th className="px-6 py-4 w-32 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                    {banners.map((banner) => (
                                        <tr key={banner.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                                                    {banner.order}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-20 w-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                                                    <img 
                                                        src={banner.image} 
                                                        alt={banner.title} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = '/images/default-product.png'; }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                {banner.badge && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {banner.badge}
                                                    </span>
                                                )}
                                                <h4 className="font-extrabold text-slate-800 text-sm mt-1">{banner.title}</h4>
                                                <p className="text-slate-400 text-[11px] font-normal leading-relaxed max-w-md line-clamp-2">{banner.subtitle}</p>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center text-slate-600">
                                                    <span className="font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded mr-1">Teks:</span>
                                                    <span>{banner.button_text || 'Detail'}</span>
                                                </div>
                                                <div className="flex items-center text-slate-400 text-[10px] font-normal truncate max-w-[150px]">
                                                    <Link size={10} className="mr-1 inline shrink-0" />
                                                    <span className="truncate">{banner.link || '#'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleActive(banner)}
                                                    className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                                                        banner.is_active 
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-100'
                                                            : 'bg-slate-150 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {banner.is_active ? (
                                                        <>
                                                            <Eye size={11} />
                                                            <span>Aktif</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff size={11} />
                                                            <span>Nonaktif</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(banner)}
                                                        className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition cursor-pointer"
                                                        title="Edit Banner"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner.id)}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg border border-red-250/30 transition cursor-pointer"
                                                        title="Hapus Banner"
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
            )}

            {/* FORM VIEW */}
            {viewMode === 'form' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
                    {/* Left Column: Form Inputs */}
                    <form onSubmit={handleSave} className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
                        <h4 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
                            <span className="p-1 bg-red-50 text-red-650 rounded-lg"><ImageIcon size={16} /></span>
                            <span>{editingBanner ? 'Edit Informasi Banner' : 'Tambah Slider Banner Baru'}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Badge */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Pita Label (Badge)</label>
                                <input 
                                    type="text"
                                    value={formBadge}
                                    onChange={(e) => setFormBadge(e.target.value)}
                                    placeholder="e.g. Promo Terbatas, Oli Pilihan"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Prioritas Urutan Tampil</label>
                                <input 
                                    type="number"
                                    value={formOrder}
                                    onChange={(e) => setFormOrder(e.target.value)}
                                    placeholder="Prioritas nomor (e.g. 1)"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Judul Banner (Wajib)</label>
                            <input 
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="e.g. Diskon 15% Untuk Tune-Up & Ganti Oli Mesin"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                required
                            />
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Sub-Deskripsi Promo</label>
                            <textarea 
                                value={formSubtitle}
                                onChange={(e) => setFormSubtitle(e.target.value)}
                                placeholder="Jelaskan detail singkat penawaran Anda..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition h-20 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Button Text */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Teks Tombol Aksi</label>
                                <input 
                                    type="text"
                                    value={formButtonText}
                                    onChange={(e) => setFormButtonText(e.target.value)}
                                    placeholder="e.g. Detail, Belanja, Booking"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                />
                            </div>

                            {/* Button Link */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Link Navigasi Tombol</label>
                                <input 
                                    type="text"
                                    value={formLink}
                                    onChange={(e) => setFormLink(e.target.value)}
                                    placeholder="e.g. /category/pelumas-dan-aki atau #"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Banner Image source selection */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Unggah Gambar Banner (Wajib)</label>
                            <div className="space-y-3">
                                {/* Drag & Drop Upload field */}
                                <div className="border-2 border-dashed border-slate-200 hover:border-red-400 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/30 transition flex flex-col items-center justify-center text-center relative">
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadImage}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <UploadCloud size={32} className="text-slate-400 mb-2" />
                                    {isUploading ? (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-bold text-red-600 animate-pulse">Mengunggah gambar...</p>
                                            <p className="text-[10px] text-slate-400">Harap tunggu beberapa saat</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-700">Tarik gambar ke sini, atau klik untuk memilih file</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Format file: JPG, PNG, WEBP, GIF (Maks. 2MB)</p>
                                        </div>
                                    )}
                                </div>

                                {/* Custom Text URL Input for Fallback */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Atau gunakan URL Gambar Langsung</label>
                                    </div>
                                    <input 
                                        type="text"
                                        value={formImage}
                                        onChange={(e) => setFormImage(e.target.value)}
                                        placeholder="e.g. https://images.unsplash.com/... atau /storage/..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <input 
                                type="checkbox"
                                id="formIsActive"
                                checked={formIsActive}
                                onChange={(e) => setFormIsActive(e.target.checked)}
                                className="h-4 w-4 text-red-650 focus:ring-red-500 border-slate-350 rounded transition cursor-pointer"
                            />
                            <label htmlFor="formIsActive" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                                Aktifkan Banner ini (Langsung tayang di halaman depan)
                            </label>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className="px-4 py-2.5 bg-slate-100 text-slate-650 hover:bg-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                            >
                                <ArrowLeft size={13} />
                                <span>Kembali</span>
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-red-650 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl transition shadow-md hover:shadow-red-500/20 cursor-pointer flex items-center space-x-1.5 uppercase tracking-wide"
                            >
                                <Save size={13} />
                                <span>Simpan Banner</span>
                            </button>
                        </div>
                    </form>

                    {/* Right Column: Visual WYSIWYG Carousel Card Preview */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
                        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-5 text-white">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                Visual Live Preview (Tampilan Web)
                            </h4>
                            
                            {/* Visual Box imitating HeroCarousel */}
                            <div className="relative h-[200px] md:h-[230px] rounded-xl overflow-hidden shadow-2xl bg-slate-850 flex items-center justify-center">
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-linear-to-r from-red-955/95 via-red-955/45 to-transparent z-10" />
                                
                                {formImage ? (
                                    <img 
                                        src={formImage} 
                                        className="w-full h-full object-cover" 
                                        alt="Preview" 
                                        onError={(e) => { e.target.src = '/images/default-product.png'; }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-500 p-4 text-center">
                                        <ImageIcon size={36} className="stroke-1 mb-2 text-slate-600" />
                                        <p className="text-[11px] font-bold text-slate-400">Menunggu Unggahan Gambar...</p>
                                        <p className="text-[9px] text-slate-500 font-medium max-w-xs mt-1">
                                            Seret file banner ke kolom input untuk melihat layout visual promosi.
                                        </p>
                                    </div>
                                )}

                                {/* Inner Text content matching storefront UI */}
                                {formImage && (
                                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-8 z-20 max-w-[85%] text-white text-left">
                                        {formBadge && (
                                            <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full w-max mb-2 uppercase tracking-wider">
                                                {formBadge}
                                            </span>
                                        )}
                                        <h2 className="text-base md:text-lg font-black tracking-tight leading-tight mb-1.5 drop-shadow-md">
                                            {formTitle || 'Judul Promo Banner'}
                                        </h2>
                                        {formSubtitle && (
                                            <p className="text-[10px] text-red-100 font-medium mb-3.5 leading-relaxed hidden sm:block">
                                                {formSubtitle}
                                            </p>
                                        )}
                                        <button 
                                            type="button" 
                                            className="bg-red-600 text-white font-extrabold text-[10px] px-4 py-1.5 rounded-lg w-max shadow-md uppercase tracking-wider"
                                        >
                                            {formButtonText || 'Detail'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Additional layout stats info */}
                            <div className="mt-4 bg-slate-850 rounded-xl p-3 border border-slate-800/80 space-y-2 text-[11px] font-medium text-slate-400">
                                <div className="flex justify-between">
                                    <span>Target Link:</span>
                                    <span className="text-white font-bold truncate max-w-[180px]">{formLink}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Prioritas Urutan:</span>
                                    <span className="text-white font-bold">Slide ke-{formOrder || '1'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status Publikasi:</span>
                                    <span className={`font-bold uppercase tracking-wider text-[10px] ${formIsActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {formIsActive ? 'Aktif (Tampil)' : 'Draft (Sembunyi)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Safe warning advice */}
                        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
                            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-[11px] font-medium leading-relaxed">
                                <p className="font-bold mb-0.5">Rekomendasi Dimensi Gambar</p>
                                <p>Untuk hasil visual terbaik di beranda e-commerce, gunakan gambar dengan rasio lebar minimal **1200 x 400 pixel** (landscape) agar tidak pecah atau terpotong saat layar melebar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
