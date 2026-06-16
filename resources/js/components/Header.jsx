import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Bell, HelpCircle, User, Car, MessageSquare, ChevronDown, LogOut, X, CheckCheck, Trash2 } from 'lucide-react';

const FacebookIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Header({ settings = {}, currentUser, cartCount, searchQuery, setSearchQuery, onOpenCart, onLogoClick, onLogout, onLoginClick, onProfileClick, notifications = [], unreadCount = 0, onNotificationClick, onMarkAllRead, onDeleteNotification }) {
    const storeName = settings.store_name || 'Putri Jaya Mobil';
    const facebookLink = settings.social_facebook || '#';
    const instagramLink = settings.social_instagram || '#';
    const whatsappNumber = settings.store_whatsapp || '6281234567890';
    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifTypeIcon = (type) => {
        switch (type) {
            case 'payment': return '💳';
            case 'shipment': return '🚚';
            default: return '📦';
        }
    };

    return (
        <header className="bg-linear-to-r from-red-600 to-red-950 text-white shadow-md sticky top-0 z-40">
            {/* Top Bar (Shopee Style) */}
            <div className="border-b border-white/10 text-xs py-1.5 hidden md:block">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <a href="#" className="hover:text-red-200 transition">Seller Centre</a>
                        <span className="text-white/30">|</span>
                        <a href="#" className="hover:text-red-200 transition">Mulai Jual</a>
                        <span className="text-white/30">|</span>
                        <a href="#" className="hover:text-red-200 transition">Download Aplikasi</a>
                        <span className="text-white/30">|</span>
                        <div className="flex items-center space-x-1.5">
                            <span>Ikuti kami di</span>
                            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="hover:text-red-200 transition"><FacebookIcon size={13} /></a>
                            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="hover:text-red-200 transition"><InstagramIcon size={13} /></a>
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-red-200 transition"><MessageSquare size={13} /></a>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell (Top Bar - Desktop) */}
                        {currentUser && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="flex items-center space-x-1 hover:text-red-200 transition cursor-pointer relative"
                                >
                                    <Bell size={13} />
                                    <span>Notifikasi</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2.5 -right-3.5 bg-yellow-400 text-red-950 font-extrabold text-[9px] h-4 min-w-[16px] flex items-center justify-center rounded-full border border-red-600 px-0.5 animate-pulse">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotifOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-[380px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50" style={{ maxHeight: '480px' }}>
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
                                            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Notifikasi</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onMarkAllRead?.(); }}
                                                        className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition"
                                                    >
                                                        <CheckCheck size={12} />
                                                        Tandai Semua Dibaca
                                                    </button>
                                                )}
                                                <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                                        <Bell size={24} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 text-sm font-semibold">Belum ada notifikasi</p>
                                                    <p className="text-slate-300 text-xs mt-1">Notifikasi pesanan Anda akan muncul di sini</p>
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className={`flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/80 transition cursor-pointer group ${!notif.is_read ? 'bg-red-50/40' : ''}`}
                                                        onClick={() => { onNotificationClick?.(notif); setIsNotifOpen(false); }}
                                                    >
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shrink-0 text-base">
                                                            {notifTypeIcon(notif.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className={`text-xs font-bold leading-snug truncate ${!notif.is_read ? 'text-slate-800' : 'text-slate-500'}`}>
                                                                    {notif.title}
                                                                </h4>
                                                                {!notif.is_read && (
                                                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1"></span>
                                                                )}
                                                            </div>
                                                            <p className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${!notif.is_read ? 'text-slate-600' : 'text-slate-400'}`}>
                                                                {notif.message}
                                                            </p>
                                                            <span className="text-[10px] text-slate-300 font-medium mt-1 block">
                                                                {timeAgo(notif.created_at)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDeleteNotification?.(notif.id); }}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition p-1 shrink-0 cursor-pointer"
                                                            title="Hapus notifikasi"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {!currentUser && (
                            <a href="#" className="flex items-center space-x-1 hover:text-red-200 transition">
                                <Bell size={13} />
                                <span>Notifikasi</span>
                            </a>
                        )}
                        <a href="#" className="flex items-center space-x-1 hover:text-red-200 transition">
                            <HelpCircle size={13} />
                            <span>Bantuan</span>
                        </a>
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-red-200 transition">
                            <span>Bahasa Indonesia</span>
                            <ChevronDown size={12} />
                        </div>
                        {currentUser ? (
                            <div className="flex items-center space-x-2 font-semibold">
                                <button
                                    onClick={onProfileClick}
                                    className="flex items-center space-x-1.5 cursor-pointer hover:text-red-200 transition font-semibold"
                                    title="Buka Profil & Pesanan Saya"
                                >
                                    {currentUser.avatar ? (
                                        <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full border border-white/30 object-cover" />
                                    ) : (
                                        <User size={13} />
                                    )}
                                    <span className="max-w-[100px] truncate">{currentUser.name?.split(' ')[0]}</span>
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="flex items-center space-x-1 text-red-200 hover:text-white transition cursor-pointer ml-1 border-l border-white/20 pl-2"
                                    title="Keluar"
                                >
                                    <LogOut size={12} />
                                    <span>Keluar</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="flex items-center space-x-1.5 cursor-pointer hover:text-red-200 transition font-semibold"
                            >
                                <User size={13} />
                                <span>Masuk</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header Bar */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center justify-between">
                    <a 
                        href="/" 
                        onClick={(e) => {
                            if (onLogoClick) {
                                e.preventDefault();
                                onLogoClick();
                            }
                        }}
                        className="flex items-center space-x-2 group"
                    >
                        <div className="bg-white text-red-600 p-2 rounded-xl shadow-lg shadow-red-950/20 group-hover:scale-105 transition duration-300">
                            <Car className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold tracking-wide bg-linear-to-r from-white to-red-200 bg-clip-text text-transparent font-sans">
                                {storeName}
                            </span>
                            <span className="block text-[10px] text-red-200 tracking-wider -mt-1 font-semibold uppercase">
                                Premium E-Commerce
                            </span>
                        </div>
                    </a>
                    
                    {/* Mobile Icons */}
                    <div className="flex items-center gap-1 md:hidden">
                        {/* Notification Bell Mobile */}
                        {currentUser && (
                            <div className="relative" ref={notifRef}>
                                <button 
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative p-2 hover:bg-white/10 rounded-full transition"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-red-950 font-bold text-[9px] h-4 min-w-[16px] flex items-center justify-center rounded-full border border-red-600 px-0.5 animate-pulse">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                        {/* Cart Icon Mobile Only */}
                        <button 
                            onClick={onOpenCart} 
                            className="relative p-2 hover:bg-white/10 rounded-full transition"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-950 font-bold text-[10px] h-5 w-5 flex items-center justify-center rounded-full border border-red-600 animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-[700px] md:mx-6">
                    <div className="relative flex items-center bg-white rounded-lg p-1 shadow-inner text-slate-800">
                        <input
                            type="text"
                            placeholder="Cari mobil impian Anda, aksesoris premium, ban, oli..."
                            className="w-full pl-3 pr-10 py-2 text-sm focus:outline-none placeholder-slate-400 bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-linear-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-5 py-2 rounded-md transition duration-200 shadow-md flex items-center justify-center">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="hidden md:flex flex-wrap items-center mt-1.5 gap-x-3 gap-y-1 text-[11px] text-red-100/90">
                        <span className="font-medium">Populer:</span>
                        <button onClick={() => setSearchQuery('Honda Civic')} className="hover:underline">Honda Civic</button>
                        <button onClick={() => setSearchQuery('Velg HSR')} className="hover:underline">Velg HSR</button>
                        <button onClick={() => setSearchQuery('Coating')} className="hover:underline">Coating Ceramic</button>
                        <button onClick={() => setSearchQuery('Oli Shell')} className="hover:underline">Oli Shell</button>
                        <button onClick={() => setSearchQuery('Aki Kering')} className="hover:underline">Aki Kering</button>
                    </div>
                </div>

                {/* Cart Icon Desktop */}
                <div className="hidden md:flex items-center space-x-6">
                    <button 
                        onClick={onOpenCart} 
                        className="relative p-2.5 hover:bg-white/10 rounded-xl transition duration-300 group flex items-center space-x-2 border border-white/10 bg-white/5"
                    >
                        <ShoppingCart className="h-6 w-6 group-hover:scale-105 transition" />
                        <span className="text-sm font-medium hidden lg:inline">Keranjang</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-950 font-extrabold text-xs h-5 w-5 flex items-center justify-center rounded-full border-2 border-red-700 shadow-md">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
