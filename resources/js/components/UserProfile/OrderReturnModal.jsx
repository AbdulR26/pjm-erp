import React, { useState } from 'react';
import { RotateCcw, Upload, X, AlertCircle, Loader, CheckCircle, Package } from 'lucide-react';
import { formatRupiah, getProductImageUrl } from '../../utils/helpers';

export default function OrderReturnModal({ isOpen, onClose, order, onSuccess }) {
    if (!isOpen || !order) return null;

    const [reasonType, setReasonType] = useState('missing_item');
    const [customerNotes, setCustomerNotes] = useState('');
    const [selectedItems, setSelectedItems] = useState(
        (order.items || []).reduce((acc, item) => {
            acc[item.id] = { selected: true, quantity: item.quantity };
            return acc;
        }, {})
    );
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleItemCheck = (itemId) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                selected: !prev[itemId]?.selected
            }
        }));
    };

    const handleQtyChange = (itemId, maxQty, val) => {
        const qty = Math.max(1, Math.min(maxQty, parseInt(val) || 1));
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                quantity: qty
            }
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newFiles = [...mediaFiles, ...files];
        setMediaFiles(newFiles);

        const newPreviews = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.includes('video') ? 'video' : 'image',
            name: file.name
        }));
        setMediaPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        const updatedFiles = mediaFiles.filter((_, i) => i !== index);
        const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
        setMediaFiles(updatedFiles);
        setMediaPreviews(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const itemsToSubmit = Object.entries(selectedItems)
            .filter(([_, data]) => data.selected && data.quantity > 0)
            .map(([orderItemId, data]) => ({
                order_item_id: parseInt(orderItemId),
                quantity: data.quantity
            }));

        if (itemsToSubmit.length === 0) {
            setErrorMsg('Pilih setidaknya 1 produk yang ingin diretur.');
            return;
        }

        if (mediaFiles.length === 0) {
            setErrorMsg('Wajib mengunggah minimal 1 foto/video sebagai bukti.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('reason_type', reasonType);
            formData.append('customer_notes', customerNotes);

            itemsToSubmit.forEach((item, index) => {
                formData.append(`items[${index}][order_item_id]`, item.order_item_id);
                formData.append(`items[${index}][quantity]`, item.quantity);
            });

            mediaFiles.forEach((file) => {
                formData.append('media[]', file);
            });

            const response = await fetch(`/orders/${order.id}/returns`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: formData
            });

            const contentType = response.headers.get('content-type') || '';
            let data = {};
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error('Terjadi kesalahan server saat memproses pengajuan retur.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengajukan retur.');
            }

            if (onSuccess) onSuccess(data.message);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Terjadi kesalahan saat membuat pengajuan retur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col my-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff5722] flex items-center justify-center">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-slate-800 text-lg">Form Pengajuan Retur & Refund</h2>
                            <p className="text-xs text-slate-400 font-medium">Order: #{order.order_number}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto grow py-5 space-y-5 pr-1">
                    {errorMsg && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 text-xs space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle size={14} /> Kebijakan Pengembalian Barang:
                        </p>
                        <p className="leading-relaxed text-[11px] text-emerald-800/90">
                            Ongkos kirim pengembalian barang (*return shipping*) sepenuhnya dibebankan dan ditanggung oleh Toko. Dana refund produk yang disetujui akan dikembalikan 100%.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Alasan Pengajuan Retur</label>
                        <select
                            value={reasonType}
                            onChange={(e) => setReasonType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#ff5722]"
                        >
                            <option value="missing_item">Barang Kurang / Qty Kurang</option>
                            <option value="damaged_item">Barang Rusak / Cacat</option>
                            <option value="wrong_item">Barang Tidak Sesuai Pesanan</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Produk & Jumlah yang Diretur</label>
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {order.items?.map(item => {
                                const itemState = selectedItems[item.id] || { selected: true, quantity: item.quantity };
                                return (
                                    <div key={item.id} className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${itemState.selected ? 'bg-orange-50/20 border-orange-200' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                                        <input
                                            type="checkbox"
                                            checked={itemState.selected}
                                            onChange={() => handleItemCheck(item.id)}
                                            className="w-4 h-4 accent-[#ff5722] rounded cursor-pointer"
                                        />
                                        <img src={getProductImageUrl(item)} alt={item.product_name} className="w-12 h-12 object-cover rounded-xl border border-slate-100" />
                                        <div className="grow min-w-0">
                                            <p className="font-bold text-xs text-slate-800 truncate">{item.product_name}</p>
                                            <p className="text-[11px] font-bold text-[#ff5722]">{formatRupiah(item.unit_price)}</p>
                                        </div>
                                        {itemState.selected && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[10px] text-slate-400 font-bold">Qty Retur:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.quantity}
                                                    value={itemState.quantity}
                                                    onChange={(e) => handleQtyChange(item.id, item.quantity, e.target.value)}
                                                    className="w-14 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold py-1 px-1 focus:border-[#ff5722] outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Keterangan / Detail Alasan</label>
                        <textarea
                            rows="3"
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder="Jelaskan kondisi barang atau alasan pengajuan retur secara detail..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#ff5722]"
                            required
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Unggah Bukti Foto & Video (Wajib)</label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-[#ff5722] rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-orange-50/10 relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                <Upload size={24} className="text-[#ff5722]" />
                                <p className="text-xs font-bold text-slate-700">Klik atau seret foto/video bukti ke sini</p>
                                <p className="text-[10px] text-slate-400">Format: JPG, PNG, WEBP, MP4, MOV (Maksimal 20MB/file)</p>
                            </div>
                        </div>

                        {mediaPreviews.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 pt-2">
                                {mediaPreviews.map((preview, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                                        {preview.type === 'video' ? (
                                            <video src={preview.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={preview.url} alt="Bukti" className="w-full h-full object-cover" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-3 shrink-0 flex gap-3">
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
                            {loading ? <Loader size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                            <span>{loading ? 'Mengirim...' : 'Kirim Pengajuan Retur'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
