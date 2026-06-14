import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    Save, RefreshCw, Store, Mail, Phone, MessageSquare, MapPin, 
    Share2, HeartHandshake, CheckCircle2, Image as ImageIcon, UploadCloud
} from 'lucide-react';

const Facebook = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const Instagram = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

export default function SettingsManagement() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Settings fields state
    const [storeName, setStoreName] = useState('');
    const [storeEmail, setStoreEmail] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [storeWhatsapp, setStoreWhatsapp] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [socialInstagram, setSocialInstagram] = useState('');
    const [socialFacebook, setSocialFacebook] = useState('');
    const [socialTiktok, setSocialTiktok] = useState('');
    const [flashSaleEndTime, setFlashSaleEndTime] = useState('');

    const [sideBanner1Badge, setSideBanner1Badge] = useState('');
    const [sideBanner1Title, setSideBanner1Title] = useState('');
    const [sideBanner1Subtitle, setSideBanner1Subtitle] = useState('');
    const [sideBanner1Image, setSideBanner1Image] = useState('');
    const [sideBanner1Link, setSideBanner1Link] = useState('');

    const [sideBanner2Badge, setSideBanner2Badge] = useState('');
    const [sideBanner2Title, setSideBanner2Title] = useState('');
    const [sideBanner2Subtitle, setSideBanner2Subtitle] = useState('');
    const [sideBanner2Image, setSideBanner2Image] = useState('');
    const [sideBanner2Link, setSideBanner2Link] = useState('');
    
    const [uploadingSide1, setUploadingSide1] = useState(false);
    const [uploadingSide2, setUploadingSide2] = useState(false);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/adminv1/api/settings');
            if (res.data && res.data.settings) {
                const s = res.data.settings;
                setStoreName(s.store_name || '');
                setStoreEmail(s.store_email || '');
                setStorePhone(s.store_phone || '');
                setStoreWhatsapp(s.store_whatsapp || '');
                setStoreAddress(s.store_address || '');
                setSocialInstagram(s.social_instagram || '');
                setSocialFacebook(s.social_facebook || '');
                setSocialTiktok(s.social_tiktok || '');

                // Convert YYYY-MM-DD HH:MM:SS to YYYY-MM-DDTHH:MM for HTML input
                let formattedEndTime = s.flash_sale_end_time || '';
                if (formattedEndTime && formattedEndTime.includes(' ')) {
                    formattedEndTime = formattedEndTime.replace(' ', 'T').substring(0, 16);
                }
                setFlashSaleEndTime(formattedEndTime);

                setSideBanner1Badge(s.side_banner_1_badge || '');
                setSideBanner1Title(s.side_banner_1_title || '');
                setSideBanner1Subtitle(s.side_banner_1_subtitle || '');
                setSideBanner1Image(s.side_banner_1_image || '');
                setSideBanner1Link(s.side_banner_1_link || '');

                setSideBanner2Badge(s.side_banner_2_badge || '');
                setSideBanner2Title(s.side_banner_2_title || '');
                setSideBanner2Subtitle(s.side_banner_2_subtitle || '');
                setSideBanner2Image(s.side_banner_2_image || '');
                setSideBanner2Link(s.side_banner_2_link || '');
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            Swal.fire('Error', 'Gagal memuat pengaturan toko.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUploadSideImage = async (e, bannerNumber) => {
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

        if (bannerNumber === 1) setUploadingSide1(true);
        else setUploadingSide2(true);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/adminv1/api/banners/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.status === 'success') {
                if (bannerNumber === 1) {
                    setSideBanner1Image(res.data.url);
                } else {
                    setSideBanner2Image(res.data.url);
                }
                showToast(`Gambar banner samping ${bannerNumber} berhasil diunggah!`);
            }
        } catch (err) {
            console.error('Error uploading side banner image:', err);
            Swal.fire('Error', err.response?.data?.message || 'Gagal mengunggah gambar.', 'error');
        } finally {
            if (bannerNumber === 1) setUploadingSide1(false);
            else setUploadingSide2(false);
        }
    };

    const applyPresetHours = (hours) => {
        const now = new Date();
        now.setHours(now.getHours() + hours);
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        setFlashSaleEndTime(`${year}-${month}-${day}T${hh}:${mm}`);
        showToast(`Waktu berakhir diatur ke +${hours} jam!`);
    };

    const applyPresetTodayEnd = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        setFlashSaleEndTime(`${year}-${month}-${day}T23:59`);
        showToast(`Waktu berakhir diatur ke akhir hari ini (23:59)!`);
    };

    const clearFlashSaleTime = () => {
        setFlashSaleEndTime('');
        showToast('Sesi Flash Sale dibersihkan / dinonaktifkan.');
    };

    const getFriendlyPresetLabel = () => {
        if (!flashSaleEndTime) return 'Belum diatur (Promo Flash Sale tidak akan aktif/tampil)';
        
        try {
            const date = new Date(flashSaleEndTime.replace('T', ' '));
            if (isNaN(date.getTime())) return '';
            
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return `Promo aktif s.d. ${date.toLocaleDateString('id-ID', options)} WIB`;
        } catch (e) {
            return '';
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!storeName) {
            Swal.fire('Perhatian', 'Nama toko wajib diisi!', 'warning');
            return;
        }

        // Simple validation: Whatsapp number check (should only contain digits, preferably start with 62)
        if (storeWhatsapp && !/^\d+$/.test(storeWhatsapp)) {
            Swal.fire('Format Salah', 'Nomor WhatsApp hanya boleh berisi angka (tanpa spasi/simbol +), e.g. 6281234567890', 'warning');
            return;
        }

        setSaving(true);
        const payload = {
            settings: {
                store_name: storeName,
                store_email: storeEmail,
                store_phone: storePhone,
                store_whatsapp: storeWhatsapp,
                store_address: storeAddress,
                social_instagram: socialInstagram,
                social_facebook: socialFacebook,
                social_tiktok: socialTiktok,
                flash_sale_end_time: flashSaleEndTime ? flashSaleEndTime.replace('T', ' ') : '',
                side_banner_1_badge: sideBanner1Badge,
                side_banner_1_title: sideBanner1Title,
                side_banner_1_subtitle: sideBanner1Subtitle,
                side_banner_1_image: sideBanner1Image,
                side_banner_1_link: sideBanner1Link,
                side_banner_2_badge: sideBanner2Badge,
                side_banner_2_title: sideBanner2Title,
                side_banner_2_subtitle: sideBanner2Subtitle,
                side_banner_2_image: sideBanner2Image,
                side_banner_2_link: sideBanner2Link
            }
        };

        try {
            const res = await axios.post('/adminv1/api/settings', payload);
            if (res.data && res.data.status === 'success') {
                Swal.fire({
                    title: 'Disimpan!',
                    text: 'Pengaturan toko berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                showToast('Pengaturan disimpan!');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan pengaturan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-wider">Pengaturan Informasi & Sosial Media</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Konfigurasi nama toko, kontak WhatsApp CS, alamat showroom fisik, serta link jejaring sosial resmi.</p>
                </div>
                <button
                    onClick={fetchSettings}
                    disabled={loading}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 transition flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto uppercase tracking-wide disabled:opacity-50"
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    <span>Segarkan</span>
                </button>
            </div>

            {/* TOAST ALERT DISPLAY */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-55 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-24 flex flex-col items-center justify-center space-y-3">
                    <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-bold">Memuat konfigurasi toko...</span>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-200">
                    {/* SECTION 1: IDENTITAS TOKO */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-5">
                        <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                            <span className="p-1.5 bg-red-50 text-red-650 rounded-lg"><Store size={16} /></span>
                            <span>Identitas Umum Toko</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Store Name */}
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Nama Toko / Bisnis (Wajib)</label>
                                <input 
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="e.g. Putri Jaya Mobil"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    required
                                />
                            </div>

                            {/* Store Email */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Surel Hubungan Pelanggan (Email)</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <Mail size={14} />
                                    </span>
                                    <input 
                                        type="email"
                                        value={storeEmail}
                                        onChange={(e) => setStoreEmail(e.target.value)}
                                        placeholder="e.g. info@putrijayamobil.com"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* Store Phone */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Nomor Telepon Hotline Kantor</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <Phone size={14} />
                                    </span>
                                    <input 
                                        type="text"
                                        value={storePhone}
                                        onChange={(e) => setStorePhone(e.target.value)}
                                        placeholder="e.g. 021-88889999"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ALAMAT & WHATSAPP */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-5">
                        <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><MessageSquare size={16} /></span>
                            <span>Kontak Transaksi & Alamat</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* WhatsApp number */}
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Nomor WhatsApp CS Utama</label>
                                <span className="block text-[10px] text-slate-400 mb-2 font-medium">
                                    Gunakan kode negara di depan tanpa lambang +, e.g. **6281234567890** (agar integrasi link chat berjalan lancar).
                                </span>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-500 pointer-events-none font-extrabold text-xs">
                                        WA
                                    </span>
                                    <input 
                                        type="text"
                                        value={storeWhatsapp}
                                        onChange={(e) => setStoreWhatsapp(e.target.value)}
                                        placeholder="e.g. 6281234567890"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* Store Address */}
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Alamat Fisik Showroom / Bengkel Utama</label>
                                <div className="relative">
                                    <span className="absolute top-3 left-3.5 text-slate-400 pointer-events-none">
                                        <MapPin size={15} />
                                    </span>
                                    <textarea 
                                        value={storeAddress}
                                        onChange={(e) => setStoreAddress(e.target.value)}
                                        placeholder="Tulis alamat detail bisnis untuk di kaki halaman (footer) web..."
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition h-24 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: SOCIAL MEDIA LINKS */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-5">
                        <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Share2 size={16} /></span>
                            <span>Tautan Jejaring Sosial</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-5">
                            {/* Instagram */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Link Instagram Resmi</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-pink-500 pointer-events-none">
                                        <Instagram size={15} />
                                    </span>
                                    <input 
                                        type="url"
                                        value={socialInstagram}
                                        onChange={(e) => setSocialInstagram(e.target.value)}
                                        placeholder="e.g. https://instagram.com/putrijayamobil"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* Facebook */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Link Halaman Facebook</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-blue-600 pointer-events-none">
                                        <Facebook size={15} />
                                    </span>
                                    <input 
                                        type="url"
                                        value={socialFacebook}
                                        onChange={(e) => setSocialFacebook(e.target.value)}
                                        placeholder="e.g. https://facebook.com/putrijayamobil"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            {/* TikTok */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Link Profil TikTok</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-800 pointer-events-none font-black text-xs">
                                        🎵
                                    </span>
                                    <input 
                                        type="url"
                                        value={socialTiktok}
                                        onChange={(e) => setSocialTiktok(e.target.value)}
                                        placeholder="e.g. https://tiktok.com/@putrijayamobil"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: BANNER PROMOSI SAMPING */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-6">
                        <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                            <span className="p-1.5 bg-red-50 text-red-650 rounded-lg"><ImageIcon size={16} /></span>
                            <span>Banner Promosi Samping (2 Banner Kecil)</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* BANNER 1 (ATAS) */}
                            <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                                <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                                    Banner Atas (Promo/Konsultasi)
                                </h5>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Badge Atas</label>
                                        <input 
                                            type="text"
                                            value={sideBanner1Badge}
                                            onChange={(e) => setSideBanner1Badge(e.target.value)}
                                            placeholder="e.g. KONSULTASI GRATIS"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Judul Banner</label>
                                        <textarea 
                                            value={sideBanner1Title}
                                            onChange={(e) => setSideBanner1Title(e.target.value)}
                                            placeholder="e.g. Bingung Cari Part Number?"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition h-12 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Deskripsi Singkat</label>
                                        <input 
                                            type="text"
                                            value={sideBanner1Subtitle}
                                            onChange={(e) => setSideBanner1Subtitle(e.target.value)}
                                            placeholder="e.g. Hubungi WhatsApp kami..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Link Navigasi</label>
                                        <input 
                                            type="text"
                                            value={sideBanner1Link}
                                            onChange={(e) => setSideBanner1Link(e.target.value)}
                                            placeholder="e.g. /category/mesin atau WhatsApp link"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Unggah Gambar Banner</label>
                                        <div className="space-y-2">
                                            <div className="border border-dashed border-slate-250 rounded-lg p-3 bg-slate-50 text-center relative hover:bg-slate-100/50 transition">
                                                <input 
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadSideImage(e, 1)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <UploadCloud size={16} className="mx-auto text-slate-400 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {uploadingSide1 ? 'Mengunggah...' : 'Klik untuk unggah gambar (Maks 2MB)'}
                                                </span>
                                            </div>
                                            <input 
                                                type="text"
                                                value={sideBanner1Image}
                                                onChange={(e) => setSideBanner1Image(e.target.value)}
                                                placeholder="Atau masukkan URL gambar..."
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Preview Banner 1 */}
                                    <div className="pt-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Live Preview (Rasio 400x150)</label>
                                        <div className="relative h-[110px] rounded-lg overflow-hidden shadow-md bg-slate-800">
                                            <div className="absolute inset-0 bg-linear-to-r from-red-800/90 to-red-950/60 z-10" />
                                            {sideBanner1Image ? (
                                                <img src={sideBanner1Image} className="w-full h-full object-cover" alt="Preview 1" onError={(e) => { e.target.src = '/images/default-product.png'; }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-750 text-slate-500 text-[10px] font-bold">
                                                    Belum ada gambar
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex flex-col justify-center px-4 z-20 text-white">
                                                <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest mb-0.5">{sideBanner1Badge || 'KONSULTASI GRATIS'}</span>
                                                <h3 className="font-bold text-xs leading-tight mb-0.5 whitespace-pre-line">{sideBanner1Title || 'Bingung Cari\nPart Number / Seri?'}</h3>
                                                <p className="text-[9px] text-red-100 font-medium line-clamp-1">{sideBanner1Subtitle || 'Kirim foto STNK & part Anda ke WhatsApp kami!'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BANNER 2 (BAWAH) */}
                            <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                                <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                                    Banner Bawah (Jaminan/Keamanan)
                                </h5>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Badge Bawah</label>
                                        <input 
                                            type="text"
                                            value={sideBanner2Badge}
                                            onChange={(e) => setSideBanner2Badge(e.target.value)}
                                            placeholder="e.g. JAMINAN ORISINIL"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Judul Banner</label>
                                        <textarea 
                                            value={sideBanner2Title}
                                            onChange={(e) => setSideBanner2Title(e.target.value)}
                                            placeholder="e.g. 100% Suku Cadang Asli"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition h-12 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Deskripsi Singkat</label>
                                        <input 
                                            type="text"
                                            value={sideBanner2Subtitle}
                                            onChange={(e) => setSideBanner2Subtitle(e.target.value)}
                                            placeholder="e.g. Garansi uang kembali penuh jika palsu."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Link Navigasi</label>
                                        <input 
                                            type="text"
                                            value={sideBanner2Link}
                                            onChange={(e) => setSideBanner2Link(e.target.value)}
                                            placeholder="e.g. /pages/garansi atau #"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Unggah Gambar Banner</label>
                                        <div className="space-y-2">
                                            <div className="border border-dashed border-slate-250 rounded-lg p-3 bg-slate-50 text-center relative hover:bg-slate-100/50 transition">
                                                <input 
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadSideImage(e, 2)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <UploadCloud size={16} className="mx-auto text-slate-400 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {uploadingSide2 ? 'Mengunggah...' : 'Klik untuk unggah gambar (Maks 2MB)'}
                                                </span>
                                            </div>
                                            <input 
                                                type="text"
                                                value={sideBanner2Image}
                                                onChange={(e) => setSideBanner2Image(e.target.value)}
                                                placeholder="Atau masukkan URL gambar..."
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Preview Banner 2 */}
                                    <div className="pt-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Live Preview (Rasio 400x150)</label>
                                        <div className="relative h-[110px] rounded-lg overflow-hidden shadow-md bg-slate-800">
                                            <div className="absolute inset-0 bg-linear-to-r from-red-900/95 to-red-950/65 z-10" />
                                            {sideBanner2Image ? (
                                                <img src={sideBanner2Image} className="w-full h-full object-cover" alt="Preview 2" onError={(e) => { e.target.src = '/images/default-product.png'; }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-750 text-slate-500 text-[10px] font-bold">
                                                    Belum ada gambar
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex flex-col justify-center px-4 z-20 text-white">
                                                <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest mb-0.5">{sideBanner2Badge || 'JAMINAN ORISINIL'}</span>
                                                <h3 className="font-bold text-xs leading-tight mb-0.5 whitespace-pre-line">{sideBanner2Title || '100% Suku Cadang Asli'}</h3>
                                                <p className="text-[9px] text-red-100 font-medium line-clamp-1">{sideBanner2Subtitle || 'Garansi uang kembali penuh jika palsu.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: PENGATURAN WAKTU FLASHSALE */}
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-5">
                        <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-3 flex items-center gap-2">
                            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">⚡</span>
                            <span>Pengaturan Sesi Promo Flash Sale</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Waktu Berakhir Flash Sale (Tanggal & Jam)</label>
                                <span className="block text-[10px] text-slate-400 mb-3 font-medium">
                                    Atur tanggal dan waktu berakhir untuk timer promo Flash Sale di halaman depan toko.
                                </span>
                                
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <input 
                                        type="datetime-local"
                                        value={flashSaleEndTime}
                                        onChange={(e) => setFlashSaleEndTime(e.target.value)}
                                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-red-500 focus:bg-white transition"
                                    />
                                    
                                    <button
                                        type="button"
                                        onClick={clearFlashSaleTime}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-650 font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-250/30 transition cursor-pointer"
                                    >
                                        Akhiri / Matikan Promo
                                    </button>
                                </div>

                                {/* Quick Presets Buttons */}
                                <div className="mt-4.5 space-y-2">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Tombol Pintas Durasi (Preset Cepat)</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => applyPresetHours(2)}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer"
                                        >
                                            +2 Jam
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyPresetHours(6)}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer"
                                        >
                                            +6 Jam
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyPresetHours(12)}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer"
                                        >
                                            +12 Jam
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyPresetHours(24)}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer"
                                        >
                                            +24 Jam (1 Hari)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={applyPresetTodayEnd}
                                            className="bg-amber-50 hover:bg-amber-100/70 text-amber-700 font-extrabold text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg border border-amber-250/30 transition cursor-pointer"
                                        >
                                            Hari Ini (s/d 23:59)
                                        </button>
                                    </div>
                                </div>

                                {/* Friendly localized dynamic date display */}
                                <div className="mt-4 p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center space-x-2 text-[11px] font-bold text-slate-605">
                                    <span className="text-amber-500">⚡</span>
                                    <span>{getFriendlyPresetLabel()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-between bg-slate-100/60 border border-slate-200/50 p-4 rounded-2xl">
                        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                            <HeartHandshake size={14} className="text-slate-400" />
                            <span>Perubahan akan langsung berdampak pada tampilan publik web.</span>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-red-650 hover:bg-red-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-red-500/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-60 uppercase tracking-wide"
                        >
                            <Save size={14} />
                            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
