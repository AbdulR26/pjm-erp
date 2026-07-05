import React, { useState, useEffect } from 'react';
import { User, ClipboardList, ArrowLeft, Pencil } from 'lucide-react';
import ProfileTab from './UserProfile/ProfileTab';
import AddressTab from './UserProfile/AddressTab';
import OrdersTab from './UserProfile/OrdersTab';

export default function UserProfilePage({ currentUser, onUpdateUser, onBack, settings, initialTab = 'profile', onTabChange }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'address' | 'orders'

    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        if (onTabChange) {
            onTabChange(activeTab);
        }
    }, [activeTab]);

    return (
        <div className="bg-[#f8fafc] min-h-[90vh] py-8 font-sans text-[14px] text-slate-800">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={onBack} 
                    className="group mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-[#ff5722] font-semibold text-sm transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span>Kembali ke Toko</span>
                </button>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-[220px] shrink-0 flex flex-col gap-6 bg-transparent p-0">
                        {/* Profile Header Block */}
                        <div className="flex items-center gap-4.5 pb-5 border-b border-slate-200/60">
                            <div className="relative group">
                                <div className="w-14 h-14 rounded-full ring-2 ring-orange-500/10 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                    {currentUser?.avatar ? (
                                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <div className="grow overflow-hidden">
                                <div className="font-bold text-slate-800 truncate text-sm leading-snug">{currentUser?.name}</div>
                                <button 
                                    onClick={() => setActiveTab('profile')} 
                                    className="flex items-center gap-1 text-[12px] text-slate-400 font-medium mt-1 hover:text-[#ff5722] transition-colors"
                                >
                                    <Pencil size={11} className="stroke-[2.5]" />
                                    <span>Ubah Profil</span>
                                </button>
                            </div>
                        </div>

                        {/* Navigation Menus */}
                        <div className="flex flex-col gap-4">
                            {/* Account Dropdown */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm mb-2.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                        <User size={14} className="stroke-[2.5]" />
                                    </div>
                                    <span>Akun Saya</span>
                                </div>
                                <div className="pl-9 flex flex-col gap-2.5">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className={`text-sm text-left transition-all duration-200 cursor-pointer ${activeTab === 'profile' ? 'text-[#ff5722] font-semibold scale-[1.02]' : 'text-slate-500 hover:text-[#ff5722]'}`}
                                    >
                                        Profil
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('address')}
                                        className={`text-sm text-left transition-all duration-200 cursor-pointer ${activeTab === 'address' ? 'text-[#ff5722] font-semibold scale-[1.02]' : 'text-slate-500 hover:text-[#ff5722]'}`}
                                    >
                                        Alamat
                                    </button>
                                </div>
                            </div>

                            {/* Purchase Menu */}
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-3 text-sm text-left font-semibold transition-all duration-200 w-full cursor-pointer py-1.5 px-3 rounded-lg ${activeTab === 'orders' ? 'text-[#ff5722] bg-orange-50/50' : 'text-slate-700 hover:text-[#ff5722] hover:bg-slate-50'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${activeTab === 'orders' ? 'bg-orange-50 text-[#ff5722]' : 'bg-orange-50/40 text-orange-500'}`}>
                                    <ClipboardList size={14} className="stroke-[2.5]" />
                                </div>
                                <span>Pesanan Saya</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[550px] flex flex-col overflow-hidden">
                        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} onUpdateUser={onUpdateUser} />}
                        {activeTab === 'address' && <AddressTab currentUser={currentUser} onUpdateUser={onUpdateUser} />}
                        {activeTab === 'orders' && <OrdersTab currentUser={currentUser} settings={settings} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
