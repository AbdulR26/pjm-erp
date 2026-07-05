import React from 'react';
import { ClipboardList, ArrowLeft, Truck, Loader, Star, CheckCircle, Copy, Check } from 'lucide-react';
import { formatRupiah, getProductImageUrl } from '../../utils/helpers';
import useOrdersTab from '../../hooks/useOrdersTab';

export default function OrdersTab({ currentUser, settings }) {
    const {
        ordersLoading,
        orderFilter,
        setOrderFilter,
        selectedOrder,
        setSelectedOrder,
        selectedOrderTracking,
        setSelectedOrderTracking,
        trackingLoading,
        payLoading,
        shipSimulateLoading,
        isReviewModalOpen,
        setIsReviewModalOpen,
        setReviewOrder,
        setReviewProduct,
        reviewRating,
        setReviewRating,
        hoverRating,
        setHoverRating,
        reviewComment,
        setReviewComment,
        reviewLoading,
        copiedText,
        profileError,
        profileSuccess,
        handleCopyText,
        handlePay,
        handleShipSimulate,
        handleReviewSubmit,
        getFilteredOrders,
        getItemProductReview,
        getStatusBadgeClass,
        getStatusLabel
    } = useOrdersTab({ currentUser, settings });

    if (selectedOrder) {
        return (
            <div className="flex-1 flex flex-col bg-slate-50/50">
                <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                        <button
                            onClick={() => { setSelectedOrder(null); setSelectedOrderTracking(null); }}
                            className="flex items-center gap-2 text-slate-550 hover:text-[#ff5722] font-semibold text-sm transition-colors cursor-pointer group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span>Kembali ke Daftar Pesanan</span>
                        </button>
                        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap">
                            <span className="text-xs text-slate-400 font-semibold">
                                No. Order: <span className="font-mono text-slate-700 font-bold text-sm">{selectedOrder.order_number}</span>
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadgeClass(selectedOrder.status)}`}>
                                {getStatusLabel(selectedOrder.status)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Alamat Pengiriman</h3>
                            <div className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-100 space-y-1.5 text-xs sm:text-sm text-slate-655">
                                <p className="font-bold text-slate-850 text-sm">{selectedOrder.shipment?.destination_contact_name || currentUser?.name}</p>
                                <p className="text-xs text-slate-450 font-medium">{selectedOrder.shipment?.destination_contact_phone || currentUser?.phone}</p>
                                <p className="leading-relaxed text-xs sm:text-sm mt-1">{selectedOrder.shipment?.destination_address || selectedOrder.shipping_address || currentUser?.address}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Informasi Pengiriman</h3>
                            {selectedOrder.shipment ? (
                                <div className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-100 space-y-2.5 text-xs sm:text-sm text-slate-655">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-450 font-semibold text-xs">Jasa Kirim</span>
                                        <span className="font-bold text-slate-700 uppercase">{selectedOrder.shipment.courier_company}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-450 font-semibold text-xs">No. Resi / Waybill</span>
                                        {selectedOrder.shipment.waybill_id ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] sm:text-xs">{selectedOrder.shipment.waybill_id}</span>
                                                <button onClick={() => handleCopyText(selectedOrder.shipment.waybill_id, 'waybill')} className="p-1 hover:bg-slate-200/50 rounded-md transition cursor-pointer text-slate-455 hover:text-slate-600">
                                                    {copiedText === 'waybill' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        ) : <span className="text-slate-455 italic text-xs">Menunggu Nomor Resi</span>}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-100 flex items-center justify-center min-h-[120px] text-center">
                                    <p className="text-xs text-slate-400 italic">Data pengiriman belum tersedia.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 pb-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                            <Truck size={16} className="text-[#ff5722]" />
                            <span>Pelacakan Status Pengiriman</span>
                        </h3>
                        {trackingLoading ? (
                            <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                                <Loader size={24} className="animate-spin text-[#ff5722]" />
                            </div>
                        ) : selectedOrderTracking && selectedOrderTracking.tracking_history && selectedOrderTracking.tracking_history.length > 0 ? (
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                                <div className="relative border-l border-slate-200 ml-3.5 pl-6.5 space-y-6">
                                    {selectedOrderTracking.tracking_history.map((event, idx) => (
                                        <div key={idx} className="relative group">
                                            <span className={`absolute left-[-37px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center ${idx === 0 ? 'bg-[#ff5722] ring-4 ring-orange-100' : 'bg-slate-350'}`}>
                                                {idx === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                                            </span>
                                            <div className="space-y-1">
                                                <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${idx === 0 ? 'text-[#ff5722] font-bold' : 'text-slate-755'}`}>{event.note || event.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center text-slate-400">
                                <p className="text-xs sm:text-sm font-semibold text-slate-505">Belum ada riwayat pengiriman.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Rincian Produk</h3>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100/80 bg-white">
                            {selectedOrder.items?.map(item => {
                                const review = getItemProductReview(item);
                                return (
                                    <div key={item.id} className="p-5 flex flex-col gap-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                                                <img src={getProductImageUrl(item)} alt={item.product_name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="grow space-y-1">
                                                <h4 className="font-bold text-slate-800 text-sm truncate">{item.product_name}</h4>
                                                <div className="text-[11px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-md inline-block">x{item.quantity}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-bold text-[#ff5722]">{formatRupiah(item.unit_price)}</div>
                                            </div>
                                        </div>

                                        {selectedOrder.status === 'completed' && (
                                            <div className="mt-2.5 pt-4 border-t border-slate-100/60 bg-slate-50/20 rounded-xl p-3">
                                                {review ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center text-amber-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={12} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-transparent"} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5"><CheckCircle size={10} /> Telah Dinilai</span>
                                                        </div>
                                                        {review.comment && <p className="text-xs text-slate-600 italic">"{review.comment}"</p>}
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs text-slate-450 font-medium">Bantu kami dengan memberikan ulasan.</p>
                                                        <button
                                                            onClick={() => {
                                                                setReviewOrder(selectedOrder);
                                                                setReviewProduct({ product_id: item.product?.parent_id || item.product_id, name: item.product_name, image: getProductImageUrl(item) });
                                                                setIsReviewModalOpen(true);
                                                            }}
                                                            className="px-4.5 py-1.5 bg-[#ff5722] text-white text-xs font-bold rounded-lg"
                                                        >
                                                            Beri Ulasan
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {isReviewModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Berikan Ulasan</h2>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none"
                                        >
                                            <Star size={32} className={(hoverRating || reviewRating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Komentar</label>
                                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full border p-2 rounded" rows="3" required></textarea>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 border p-2 rounded font-semibold text-slate-600">Batal</button>
                                    <button type="submit" disabled={reviewLoading} className="flex-1 bg-[#ff5722] text-white p-2 rounded font-semibold">{reviewLoading ? 'Mengirim...' : 'Kirim Ulasan'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List of Orders View
    return (
        <div className="flex-1 flex flex-col p-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-6">Pesanan Saya</h3>
            
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-slate-100 pb-2">
                {['all', 'pending', 'processing', 'shipping', 'completed', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setOrderFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${orderFilter === status ? 'bg-[#ff5722] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        {status === 'all' ? 'Semua' : getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#ff5722] gap-3">
                    <Loader size={32} className="animate-spin" />
                </div>
            ) : getFilteredOrders().length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <p className="text-sm font-bold text-slate-500">Tidak ada pesanan ditemukan.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {getFilteredOrders().map(order => (
                        <div key={order.id} className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-xs">
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 font-semibold">{new Date(order.created_at).toLocaleDateString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getStatusBadgeClass(order.status)}`}>{getStatusLabel(order.status)}</span>
                                    <span className="text-xs font-mono font-bold text-slate-700">{order.order_number}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-semibold">Total: <span className="text-[#ff5722] font-bold text-sm">{formatRupiah(order.total)}</span></span>
                            </div>
                            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 grow">
                                    {order.items && order.items[0] && (
                                        <>
                                            <img src={getProductImageUrl(order.items[0])} alt="Product" className="w-16 h-16 object-cover rounded border" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{order.items[0].product_name}</p>
                                                {order.items.length > 1 && <p className="text-xs text-slate-500 mt-1">+{order.items.length - 1} produk lainnya</p>}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <button onClick={() => handlePay(order.id)} disabled={payLoading[order.id]} className="px-4 py-2 bg-[#ff5722] text-white text-xs font-bold rounded-lg cursor-pointer">
                                            {payLoading[order.id] ? 'Memproses...' : 'Bayar Sekarang'}
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer">
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
