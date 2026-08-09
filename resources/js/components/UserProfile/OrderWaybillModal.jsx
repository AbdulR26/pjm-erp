import React, { useState } from 'react';
import { Truck, X, AlertCircle, Loader, CheckCircle } from 'lucide-react';

export default function OrderWaybillModal({ isOpen, onClose, returnData, onSuccess }) {
    if (!isOpen || !returnData) return null;

    const [courierName, setCourierName] = useState('JNE');
    const [waybillId, setWaybillId] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!waybillId.trim()) {
            setErrorMsg('Nomor resi pengembalian wajib diisi.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/returns/${returnData.id}/input-waybill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    return_courier_name: courierName,
                    return_waybill_id: waybillId
                })
            });

            const contentType = response.headers.get('content-type') || '';
            let data = {};
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Terjadi kesalahan server saat menyimpan resi retur.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menyimpan nomor resi retur.');
            }

            if (onSuccess) onSuccess(data.message);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan resi retur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Truck size={20} />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-slate-800 text-base">Input Resi Pengembalian Barang</h2>
                            <p className="text-xs text-slate-400 font-medium">Retur: #{returnData.return_number}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="py-5 space-y-4">
                    {errorMsg && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-emerald-500" /> Pengajuan Disetujui Admin
                        </p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                            Kirim barang retur ke alamat gudang toko kami dan masukkan nomor resi di bawah. Ongkos kirim pengembalian ditanggung pembeli.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kurir Pengembalian</label>
                        <input
                            type="text"
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                            placeholder="Contoh: JNE / J&T / SiCepat / AnterAja"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#ff5722]"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor Resi (Waybill ID)</label>
                        <input
                            type="text"
                            value={waybillId}
                            onChange={(e) => setWaybillId(e.target.value)}
                            placeholder="Masukkan nomor resi pengembalian..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold font-mono text-slate-800 focus:outline-none focus:border-[#ff5722]"
                            required
                        />
                    </div>

                    <div className="pt-3 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 rounded-xl bg-[#ff5722] hover:bg-[#e04816] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : <Truck size={16} />}
                            <span>{loading ? 'Simpan...' : 'Simpan Resi Retur'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
