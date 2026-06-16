import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, UsersRound, LogOut, Car, Shield, Menu, X, Package, ShoppingCart, FolderTree, Tag, Warehouse, ChevronDown, Image, Settings, Ticket, MessageSquare, FileText } from 'lucide-react';

export default function Layout({ user, currentTab, setTab, onLogout, children }) {
    const isAdmin = user.roles.includes('admin');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [purchasingOpen, setPurchasingOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    
    const catalogRef = useRef(null);
    const purchasingRef = useRef(null);
    const settingsRef = useRef(null);
    const userMenuRef = useRef(null);

    const isCatalogActive = ['products', 'categories', 'attributes', 'stock', 'vouchers'].includes(currentTab);
    const isPurchasingActive = ['suppliers', 'purchase-orders'].includes(currentTab);
    const isSettingsActive = ['banners', 'settings'].includes(currentTab);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (catalogRef.current && !catalogRef.current.contains(e.target)) {
                setCatalogOpen(false);
            }
            if (purchasingRef.current && !purchasingRef.current.contains(e.target)) {
                setPurchasingOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setSettingsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const catalogChildren = [
        { id: 'products',   label: 'Produk',         icon: Package,    visible: true },
        { id: 'categories', label: 'Kategori',        icon: FolderTree, visible: true },
        { id: 'attributes', label: 'Atribut Produk', icon: Tag,        visible: true },
        { id: 'stock',      label: 'Manajemen Stok', icon: Warehouse,  visible: true },
        { id: 'vouchers',   label: 'Voucher Promo',  icon: Ticket,     visible: true },
    ];

    const purchasingChildren = [
        { id: 'suppliers',       label: 'Supplier',       icon: UsersRound, visible: true },
        { id: 'purchase-orders', label: 'Purchase Order',  icon: FileText,   visible: true },
    ];

    const settingsChildren = [
        { id: 'banners',  label: 'Slider Banner', icon: Image,    visible: true },
        { id: 'settings', label: 'Info & Sosmed',  icon: Settings, visible: isAdmin },
    ];

    const handleTabChange = (tabId) => {
        setTab(tabId);
        setIsMobileOpen(false);
        setCatalogOpen(false);
        setPurchasingOpen(false);
        setSettingsOpen(false);
        setUserMenuOpen(false);
    };

    const pageTitle = {
        dashboard:  'Dashboard Utama',
        orders:     'Manajemen Order & Transaksi',
        products:   'Manajemen Produk & Inventaris',
        categories: 'Manajemen Kategori',
        attributes: 'Atribut Produk',
        stock:      'Manajemen Stok & Inventaris',
        vouchers:   'Manajemen Voucher Promo',
        suppliers:  'Manajemen Supplier',
        'purchase-orders': 'Manajemen Purchase Order (PO)',
        users:      'Manajemen Staff & Admin',
        customers:  'Manajemen Database Customer',
        chats:      'Live Chat Customer Service',
        banners:    'Pengaturan Slider Banner',
        settings:   'Pengaturan Toko & Sosial Media',
    }[currentTab] || '';

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">

            {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
            <header className="bg-white border-b border-slate-200 shadow-sm shrink-0 z-30">

                {/* Brand row + nav + user */}
                <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8 gap-4">

                    {/* Brand */}
                    <div className="flex items-center space-x-2.5 shrink-0">
                        <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-sm">
                            <Car className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-slate-800 tracking-wide text-sm block leading-tight">PJM Admin</span>
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block -mt-0.5">Putri Jaya Mobil</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-8 bg-slate-200 mx-1 shrink-0" />

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-1 flex-1">

                        {/* Dashboard */}
                        <button
                            onClick={() => handleTabChange('dashboard')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                currentTab === 'dashboard'
                                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <LayoutDashboard size={16} />
                            <span>Dashboard</span>
                        </button>

                        {/* Order */}
                        <button
                            onClick={() => handleTabChange('orders')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                currentTab === 'orders'
                                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <ShoppingCart size={16} />
                            <span>Order</span>
                        </button>

                        {/* Katalog Dropdown */}
                        <div className="relative" ref={catalogRef}>
                            <button
                                onClick={() => setCatalogOpen(o => !o)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    isCatalogActive
                                        ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Package size={16} />
                                <span>Katalog & Inventaris</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${catalogOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {catalogOpen && (
                                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {catalogChildren.filter(c => c.visible).map(child => {
                                        const CIcon = child.icon;
                                        const isActive = currentTab === child.id;
                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() => handleTabChange(child.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            >
                                                <CIcon size={15} className={isActive ? 'text-red-500' : 'text-slate-400'} />
                                                {child.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pembelian Dropdown (Desktop) */}
                        <div className="relative" ref={purchasingRef}>
                            <button
                                onClick={() => setPurchasingOpen(o => !o)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    isPurchasingActive
                                        ? 'bg-red-650 text-white shadow-sm shadow-red-600/30'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <FileText size={16} />
                                <span>Pembelian (PO)</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${purchasingOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {purchasingOpen && (
                                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {purchasingChildren.filter(c => c.visible).map(child => {
                                        const CIcon = child.icon;
                                        const isActive = currentTab === child.id;
                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() => handleTabChange(child.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-red-50 text-red-650'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            >
                                                <CIcon size={15} className={isActive ? 'text-red-500' : 'text-slate-400'} />
                                                {child.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Customer */}
                        <button
                            onClick={() => handleTabChange('customers')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                currentTab === 'customers'
                                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <UsersRound size={16} />
                            <span>Customer</span>
                        </button>
 
                        {/* Chat */}
                        <button
                            onClick={() => handleTabChange('chats')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                currentTab === 'chats'
                                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <MessageSquare size={16} />
                            <span>Chat CS</span>
                        </button>

                        {/* Staff (admin only) */}
                        {isAdmin && (
                            <button
                                onClick={() => handleTabChange('users')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    currentTab === 'users'
                                        ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Shield size={16} />
                                <span>Staff</span>
                            </button>
                        )}

                        {/* Pengaturan Dropdown (Desktop) */}
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setSettingsOpen(o => !o)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    isSettingsActive
                                        ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Settings size={16} />
                                <span>Pengaturan Toko</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {settingsOpen && (
                                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {settingsChildren.filter(c => c.visible).map(child => {
                                        const CIcon = child.icon;
                                        const isActive = currentTab === child.id;
                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() => handleTabChange(child.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                                    isActive
                                                        ? 'bg-red-55 text-red-600'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            >
                                                <CIcon size={15} className={isActive ? 'text-red-500' : 'text-slate-400'} />
                                                {child.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Right: User Menu + Hamburger */}
                    <div className="ml-auto flex items-center gap-2">

                        {/* User Dropdown (Desktop) */}
                        <div className="hidden md:block relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(o => !o)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition duration-200 cursor-pointer"
                            >
                                <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center font-bold text-red-600 border border-red-100 text-sm shrink-0">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-bold text-slate-800 block leading-tight">{user.name}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-wide ${isAdmin ? 'text-red-500' : 'text-slate-400'}`}>
                                        {isAdmin ? 'Admin' : 'Staff'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition duration-150 cursor-pointer"
                                    >
                                        <LogOut size={15} />
                                        Keluar Sesi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Hamburger (Mobile) */}
                        <button
                            onClick={() => setIsMobileOpen(o => !o)}
                            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            title="Menu"
                        >
                            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile Dropdown Menu ─────────────────────────────── */}
                {isMobileOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {/* User info */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl">
                            <div className="h-9 w-9 bg-red-50 rounded-full flex items-center justify-center font-bold text-red-600 border border-red-100">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                        </div>

                        {/* Mobile nav items */}
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
                            { id: 'orders', label: 'Manajemen Order', icon: ShoppingCart, visible: true },
                        ].filter(i => i.visible).map(item => {
                            const Icon = item.icon;
                            const isActive = currentTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                                        isActive ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon size={17} />
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Katalog group in mobile */}
                        <div className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Katalog & Inventaris</div>
                        {catalogChildren.filter(c => c.visible).map(child => {
                            const CIcon = child.icon;
                            const isActive = currentTab === child.id;
                            return (
                                <button
                                    key={child.id}
                                    onClick={() => handleTabChange(child.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                                        isActive ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <CIcon size={16} />
                                    {child.label}
                                </button>
                            );
                        })}

                        {/* Pembelian group in mobile */}
                        <div className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pembelian (PO)</div>
                        {purchasingChildren.filter(c => c.visible).map(child => {
                            const CIcon = child.icon;
                            const isActive = currentTab === child.id;
                            return (
                                <button
                                    key={child.id}
                                    onClick={() => handleTabChange(child.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                                        isActive ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <CIcon size={16} />
                                    {child.label}
                                </button>
                            );
                        })}

                        {[
                            { id: 'customers', label: 'Manajemen Customer', icon: UsersRound, visible: true },
                            { id: 'chats', label: 'Chat Customer Service', icon: MessageSquare, visible: true },
                            { id: 'users', label: 'Manajemen Staff', icon: Shield, visible: isAdmin },
                        ].filter(i => i.visible).map(item => {
                            const Icon = item.icon;
                            const isActive = currentTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                                        isActive ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon size={17} />
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Settings group in mobile */}
                        <div className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengaturan Toko</div>
                        {settingsChildren.filter(c => c.visible).map(child => {
                            const CIcon = child.icon;
                            const isActive = currentTab === child.id;
                            return (
                                <button
                                    key={child.id}
                                    onClick={() => handleTabChange(child.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                                        isActive ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <CIcon size={16} />
                                    {child.label}
                                </button>
                            );
                        })}

                        {/* Mobile logout */}
                        <div className="pt-2 border-t border-slate-100 mt-2">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition duration-200 cursor-pointer"
                            >
                                <LogOut size={17} />
                                Keluar Sesi
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Page title bar ──────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shrink-0">
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">{pageTitle}</h2>
            </div>

            {/* ── Main Content ────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="w-full animate-in fade-in duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}
