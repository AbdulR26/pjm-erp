import React, { useState, useEffect } from 'react';
import { User, CheckCircle, AlertCircle, Clock, Package, Truck, CheckSquare, Wallet, RotateCcw, FileText, ArrowRight, Loader } from 'lucide-react';
import { getCsrfToken, formatRupiah } from '../../utils/helpers';

export default function ProfileTab({ currentUser, onUpdateUser, onNavigateOrders }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [gender, setGender] = useState('laki-laki');
    
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    const [summaryData, setSummaryData] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setPhone(currentUser.phone || '');
            setAddress(currentUser.address || '');
            setPostalCode(currentUser.postal_code || '');
            setLatitude(currentUser.latitude || '');
            setLongitude(currentUser.longitude || '');
        }

        fetchSummary();
    }, [currentUser]);

    const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
            const res = await fetch('/customer/summary');
            let serverSummary = null;
            if (res.ok) {
                serverSummary = await res.json();
                setSummaryData(serverSummary);
            }

            const ordersRes = await fetch('/api/orders');
            if (ordersRes.ok) {
                const ordersList = await ordersRes.json();
                if (Array.isArray(ordersList) && ordersList.length > 0) {
                    const pending = ordersList.filter(o => o.status === 'pending' || o.status_id == 1).length;
                    const processing = ordersList.filter(o => o.status === 'processing' || o.status_id == 2).length;
                    const shipping = ordersList.filter(o => o.status === 'shipping' || o.status_id == 3).length;
                    const completed = ordersList.filter(o => o.status === 'completed' || o.status_id == 4).length;

                    setSummaryData({
                        summary: {
                            pending_orders: pending,
                            processing_orders: processing,
                            shipping_orders: shipping,
                            completed_orders: completed,
                            total_orders: ordersList.length,
                            total_refund_balance: serverSummary?.summary?.total_refund_balance || 0,
                            total_refund_count: serverSummary?.summary?.total_refund_count || 0,
                        },
                        refund_history: serverSummary?.refund_history || [],
                        recent_orders: ordersList.slice(0, 5)
                    });
                }
            }
        } catch (e) {
            console.error('Failed to fetch summary:', e);
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ name, phone, address, postal_code: postalCode, latitude, longitude })
            });
            const data = await res.json();
            if (res.ok) {
                setProfileSuccess('Profil berhasil diperbarui!');
                if (onUpdateUser) {
                    onUpdateUser(data.customer);
                }
            } else {
                if (data.status === 'validation_error') {
                    const firstErr = Object.values(data.errors)[0][0];
                    setProfileError(firstErr);
                } else {
                    setProfileError(data.message || 'Gagal memperbarui profil.');
                }
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setProfileLoading(false);
        }
    };

    const summary = summaryData?.summary || {
        pending_orders: 0,
        processing_orders: 0,
        shipping_orders: 0,
        completed_orders: 0,
        total_orders: 0,
        total_refund_balance: 0,
        total_refund_count: 0
    };

    const refundHistory = summaryData?.refund_history || [];

    return (
        <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col space-y-8">
            {/* 1. Header & Quick Summary */}
            <div className="border-b border-slate-100 pb-5">
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Profil & Ringkasan Akun</h3>
                <p className="text-xs text-slate-400 mt-1">Pantau status pesanan, saldo refund, serta kelola informasi profil Anda</p>
            </div>

            {/* 2. Order Status Summary Cards */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ringkasan Pesanan</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Menunggu Bayar</p>
                            <h4 className="text-xl font-extrabold text-amber-900 mt-0.5">{summary.pending_orders}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                            <Clock size={20} />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Diproses</p>
                            <h4 className="text-xl font-extrabold text-blue-900 mt-0.5">{summary.processing_orders}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                            <Package size={20} />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">Dikirim</p>
                            <h4 className="text-xl font-extrabold text-purple-900 mt-0.5">{summary.shipping_orders}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                            <Truck size={20} />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Selesai</p>
                            <h4 className="text-xl font-extrabold text-emerald-900 mt-0.5">{summary.completed_orders}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckSquare size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Refund Balance & Refund Sources Breakdown */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informasi Saldo & Riwayat Refund</h4>
                
                {/* Total Refund Banner */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
                            <Wallet size={16} />
                            <span>Total Akumulasi Saldo Refund Diterima</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white">{formatRupiah(summary.total_refund_balance)}</h2>
                        <p className="text-[11px] text-emerald-100/90 font-medium">
                            Dari total {summary.total_refund_count} transaksi pengajuan retur barang yang disetujui
                        </p>
                    </div>
                    <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
                        <span className="text-[11px] text-emerald-100 block font-semibold">Status Pengembalian</span>
                        <span className="text-xs font-extrabold text-white flex items-center gap-1 mt-0.5">
                            <CheckCircle size={14} className="text-emerald-300" /> Terverifikasi Sistem
                        </span>
                    </div>
                </div>

                {/* Refund Sources History List */}
                <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                            <RotateCcw size={16} className="text-emerald-600" />
                            <span>Rincian Sumber Refund (Riwayat Retur)</span>
                        </h5>
                        <span className="text-[11px] text-slate-400 font-semibold">{refundHistory.length} Transaksi</span>
                    </div>

                    {summaryLoading ? (
                        <div className="py-8 flex justify-center text-slate-400">
                            <Loader size={20} className="animate-spin text-emerald-600" />
                        </div>
                    ) : refundHistory.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-xl border border-slate-100 text-slate-400">
                            <p className="text-xs font-semibold">Belum ada riwayat pengembalian dana (refund).</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                            {refundHistory.map((item) => (
                                <div key={item.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-200 transition shadow-2xs">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono font-bold text-xs text-slate-800">{item.return_number}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Order: #{item.order_number}</span>
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold">
                                                {item.reason_label}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                            <span>Tgl Refund: {item.refunded_at}</span>
                                            &bull;
                                            <span className="font-semibold text-slate-700">Metode: {item.refund_method_label}</span>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                                            + {formatRupiah(item.refund_amount)}
                                        </span>
                                        {item.manual_transfer_proof && (
                                            <a href={item.manual_transfer_proof} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-600 font-bold mt-1 hover:underline">
                                                Lihat Bukti Transfer
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Edit Profile Form */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengaturan Identitas Profil</h4>
                
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5 max-w-2xl">
                    {profileSuccess && (
                        <div className="bg-emerald-50/60 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-medium">
                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            <span>{profileSuccess}</span>
                        </div>
                    )}
                    {profileError && (
                        <div className="bg-red-50/60 border border-red-100 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-medium">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <span>{profileError}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[28%] text-slate-400 text-xs font-semibold mb-1 sm:mb-0">Username / Email</label>
                        <div className="w-full sm:w-[72%] text-slate-800 text-xs font-bold py-1">
                            {currentUser?.email || '-'}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[28%] text-slate-400 text-xs font-semibold mb-1 sm:mb-0">Nama Lengkap</label>
                        <div className="w-full sm:w-[72%]">
                            <input 
                                type="text" 
                                className="w-full h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-xs font-semibold text-slate-800 transition outline-none bg-slate-50/40 focus:bg-white" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                disabled={profileLoading} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[28%] text-slate-400 text-xs font-semibold mb-1 sm:mb-0">Nomor Telepon</label>
                        <div className="w-full sm:w-[72%]">
                            <input 
                                type="text" 
                                className="w-full h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-xs font-semibold text-slate-800 transition outline-none bg-slate-50/40 focus:bg-white" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                disabled={profileLoading} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[28%] text-slate-400 text-xs font-semibold mb-1 sm:mb-0">Alamat Lengkap</label>
                        <div className="w-full sm:w-[72%]">
                            <textarea 
                                rows="2" 
                                className="w-full p-3 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-xs font-semibold text-slate-800 transition outline-none bg-slate-50/40 focus:bg-white" 
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                                disabled={profileLoading} 
                                required 
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center pt-2">
                        <div className="w-full sm:w-[28%]"></div>
                        <div className="w-full sm:w-[72%]">
                            <button 
                                type="submit" 
                                disabled={profileLoading} 
                                className="px-6 py-2.5 bg-[#ff5722] hover:bg-[#e04816] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                            >
                                {profileLoading ? 'Simpan Perubahan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
