import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, UsersRound, Calendar, DollarSign, PlusCircle, 
    Wrench, Shield, CheckCircle, ShoppingBag, Activity 
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Dashboard({ user, setTab }) {
    const [stats, setStats] = useState({
        customer_count: 0,
        staff_count: 0,
        order_count: 0,
        pending_order_count: 0,
        product_count: 0,
        total_sales: 0,
        po_count: 0,
        activities: []
    });
    const [isLoading, setIsLoading] = useState(true);
    
    const isAdmin = user.roles.includes('admin');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('/adminv1/api/dashboard/stats');
                if (res.data) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard counts:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Greeting Header */}
            <div className="bg-linear-to-r from-red-700 via-red-600 to-red-950 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 bg-white/5 rounded-full pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                    <span className="bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Sistem Informasi PJM
                    </span>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight leading-tight">
                        Selamat Datang Kembali, {user.name}!
                    </h1>
                    <p className="text-xs md:text-sm text-red-100 max-w-xl font-medium leading-relaxed">
                        Anda masuk sebagai <span className="font-extrabold underline">{isAdmin ? 'Administrator' : 'Staff Operasional'}</span>. Berikut adalah ringkasan performa dan database suku cadang Putri Jaya Mobil hari ini.
                    </p>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customers */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Customer</span>
                        <h3 className="text-2xl font-black text-slate-800">
                            {isLoading ? '...' : `${stats.customer_count} Orang`}
                        </h3>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                            <CheckCircle size={10} className="mr-1" /> Database aktif
                        </span>
                    </div>
                    <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                        <UsersRound size={20} />
                    </div>
                </div>

                {/* Total Staff (Admin Only Card Detail) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Staff/Admin</span>
                        <h3 className="text-2xl font-black text-slate-800">
                            {!isAdmin ? 'Terkunci' : isLoading ? '...' : `${stats.staff_count} Orang`}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {isAdmin ? 'Hak akses panel penuh' : 'Akses terbatas untuk Staff'}
                        </span>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition ${
                        isAdmin ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                        <Shield size={20} />
                    </div>
                </div>

                {/* Total Orders / Pemesanan */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Order Masuk</span>
                        <h3 className="text-2xl font-black text-slate-800">
                            {isLoading ? '...' : `${stats.order_count} Transaksi`}
                        </h3>
                        <span className="text-[10px] text-amber-600 font-semibold">
                            ⚠️ {stats.pending_order_count} Menunggu Proses
                        </span>
                    </div>
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                        <ShoppingBag size={20} />
                    </div>
                </div>

                {/* Sales Turnover (Dynamic Omset) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Omset</span>
                        <h3 className="text-2xl font-black text-slate-800">
                            {isLoading ? '...' : fmt(stats.total_sales)}
                        </h3>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                            Pembayaran terkonfirmasi
                        </span>
                    </div>
                    <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                        <DollarSign size={20} />
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions Panel */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
                            Aksi Cepat
                        </h4>
                        <div className="space-y-3">
                             <button
                                onClick={() => setTab('customers')}
                                className="w-full flex items-center space-x-3 p-3 bg-red-50/50 hover:bg-red-50 text-red-700 rounded-xl border border-red-100/50 transition font-bold text-xs text-left cursor-pointer"
                            >
                                <PlusCircle size={16} />
                                <span>Tambah Pelanggan Baru</span>
                            </button>
                            
                            {isAdmin && (
                                <button
                                    onClick={() => setTab('users')}
                                    className="w-full flex items-center space-x-3 p-3 bg-red-50/50 hover:bg-red-50 text-red-700 rounded-xl border border-red-100/50 transition font-bold text-xs text-left cursor-pointer"
                                >
                                    <Shield size={16} />
                                    <span>Kelola Akun Staff & Admin</span>
                                </button>
                            )}

                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center space-x-3 p-3 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/50 transition font-bold text-xs text-left"
                            >
                                <Wrench size={16} />
                                <span>WhatsApp Customer Gateway</span>
                            </a>
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 font-semibold mt-6 pt-3 border-t border-slate-50 text-center">
                        Butuh bantuan teknis? Hubungi IT Support PJM.
                    </div>
                </div>

                {/* Recent Activities Panel */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs lg:col-span-2">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
                        Aktifitas Sistem Terbaru
                    </h4>
                    
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <div className="h-6 w-6 border-2 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2 text-slate-400 font-semibold text-[10px]">Memuat aktifitas terbaru...</p>
                        </div>
                    ) : stats.activities.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                            Belum ada aktifitas sistem yang tercatat.
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {stats.activities.map((activity, index) => {
                                let dotColor = 'bg-slate-400';
                                if (activity.type === 'order') dotColor = 'bg-red-500';
                                else if (activity.type === 'supplier') dotColor = 'bg-blue-500';
                                else if (activity.type === 'purchase_order') dotColor = 'bg-purple-500';
                                else if (activity.type === 'stock_mutation') dotColor = 'bg-emerald-500';

                                return (
                                    <div key={index} className="flex items-start space-x-3 text-xs leading-normal">
                                        <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`}></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-700">
                                                {activity.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 block mt-0.5 animate-pulse">
                                                {activity.time_label} • oleh {activity.user}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
