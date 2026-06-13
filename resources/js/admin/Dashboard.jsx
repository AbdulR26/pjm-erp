import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UsersRound, Calendar, DollarSign, PlusCircle, Wrench, Shield, CheckCircle } from 'lucide-react';

export default function Dashboard({ user, setTab }) {
    const [staffCount, setStaffCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    
    const isAdmin = user.roles.includes('admin');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch customer count (accessible by both roles)
                const custRes = await axios.get('/adminv1/api/customers');
                if (custRes.data && custRes.data.customers) {
                    setCustomerCount(custRes.data.customers.length);
                }

                // Fetch staff count (admin only)
                if (isAdmin) {
                    const userRes = await axios.get('/adminv1/api/users');
                    if (userRes.data && userRes.data.users) {
                        setStaffCount(userRes.data.users.length);
                    }
                }
            } catch (err) {
                console.error('Error fetching dashboard counts:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAdmin]);

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
                            {isLoading ? '...' : `${customerCount} Orang`}
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
                            {!isAdmin ? 'Terkunci' : isLoading ? '...' : `${staffCount} Orang`}
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

                {/* Active Bookings (Mocked) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Booking Servis</span>
                        <h3 className="text-2xl font-black text-slate-800">8 Pengerjaan</h3>
                        <span className="text-[10px] text-amber-600 font-semibold">
                            ⚠️ 3 Menunggu Konfirmasi
                        </span>
                    </div>
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                        <Calendar size={20} />
                    </div>
                </div>

                {/* Sales Turnover (Mocked) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Estimasi Omset</span>
                        <h3 className="text-2xl font-black text-slate-800">Rp 48,9 M</h3>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                            📈 Naik 12.5% bulan ini
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
                        Aktifitas Sistem Terbaru (Simulasi)
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 text-xs leading-normal">
                            <div className="h-2 w-2 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-700">
                                    Customer <span className="font-bold">Andi Wijaya</span> berhasil ditambahkan ke database pelanggan.
                                </p>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Baru saja • oleh Super Admin</span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs leading-normal">
                            <div className="h-2 w-2 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-700">
                                    Oli Shell Helix Ultra 5W-40 diperbarui datanya di katalog frontend.
                                </p>
                                <span className="text-[10px] text-slate-400 block mt-0.5">15 menit yang lalu • oleh Staff Operasional</span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs leading-normal">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-700">
                                    Sinkronisasi data WhatsApp Gateway berhasil diselesaikan.
                                </p>
                                <span className="text-[10px] text-slate-400 block mt-0.5">1 jam yang lalu • oleh Sistem</span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 text-xs leading-normal">
                            <div className="h-2 w-2 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-700">
                                    Role baru `customer` ditambahkan ke basis data oleh seeder migration.
                                </p>
                                <span className="text-[10px] text-slate-400 block mt-0.5">2 jam yang lalu • oleh Developer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
