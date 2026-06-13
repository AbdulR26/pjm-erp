import React, { useState } from 'react';
import { LayoutDashboard, Users, UsersRound, LogOut, Car, Shield, Menu, X } from 'lucide-react';

export default function Layout({ user, currentTab, setTab, onLogout, children }) {
    const isAdmin = user.roles.includes('admin');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
        { id: 'users', label: 'Manajemen Staff', icon: Shield, visible: isAdmin },
        { id: 'customers', label: 'Manajemen Customer', icon: UsersRound, visible: true },
    ];

    const handleTabChange = (tabId) => {
        setTab(tabId);
        setIsMobileOpen(false); // Close sidebar on mobile after choosing a menu
    };

    const NavigationContent = () => (
        <>
            {/* Sidebar Brand Header */}
            <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800/60 shrink-0">
                <div className="flex items-center space-x-2.5">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <Car className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-white tracking-wide text-sm block">PJM Admin</span>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block -mt-1">Putri Jaya Mobil</span>
                    </div>
                </div>
                {/* Mobile close button inside sidebar */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden ml-auto p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                    <X size={18} />
                </button>
            </div>

            {/* User Profile Summary in Sidebar */}
            <div className="px-4 py-6 border-b border-slate-800/60 bg-slate-950/20 shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-linear-to-tr from-blue-600 to-indigo-700 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <span className="text-sm font-bold text-white block truncate">{user.name}</span>
                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider ${
                            isAdmin 
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                            {isAdmin ? 'Admin' : 'Staff'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="px-3 py-4 space-y-1 grow overflow-y-auto">
                {menuItems.filter(item => item.visible).map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold rounded-xl transition duration-200 cursor-pointer ${
                                isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                        >
                            <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Bottom (Logout) */}
            <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 shrink-0">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 font-bold py-2.5 px-4 rounded-xl transition duration-200 border border-slate-700/50 hover:border-rose-900/50 cursor-pointer"
                >
                    <LogOut size={16} />
                    <span>Keluar Sesi</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop Sidebar (Persistent) */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl h-full">
                <NavigationContent />
            </aside>

            {/* Mobile Sidebar Overlay Drawer */}
            {isMobileOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
                    />
                    {/* Mobile Drawer */}
                    <aside className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl z-50 md:hidden animate-in slide-in-from-left duration-200 h-full">
                        <NavigationContent />
                    </aside>
                </>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden h-full">
                {/* Header Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-xs shrink-0 z-10">
                    <div className="flex items-center space-x-3">
                        {/* Hamburger button visible only on mobile/tablet */}
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition focus:outline-hidden cursor-pointer"
                            title="Menu Navigasi"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-800 uppercase tracking-wider truncate max-w-[180px] sm:max-w-none">
                            {currentTab === 'dashboard' && 'Dashboard Utama'}
                            {currentTab === 'users' && 'Manajemen Staff & Admin'}
                            {currentTab === 'customers' && 'Manajemen Database Customer'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <span className="text-sm font-bold text-slate-800 block leading-tight">{user.name}</span>
                            <span className="text-xs text-slate-400 font-semibold">{user.email}</span>
                        </div>
                        <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-blue-600 border border-slate-200 shadow-xs shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Content Container (Responsive Padding) */}
                <main className="grow overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-100/50">
                    <div className="w-full animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
