import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export default function useOrdersTab({ currentUser, settings }) {
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderFilter, setOrderFilter] = useState('all');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [payLoading, setPayLoading] = useState({});
    const [shipSimulateLoading, setShipSimulateLoading] = useState({});

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [reviewProduct, setReviewProduct] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewPhoto, setReviewPhoto] = useState(null);
    const [reviewPhotoPreview, setReviewPhotoPreview] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    const [copiedText, setCopiedText] = useState(null);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    const handleCopyText = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedText(type);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data pesanan:", e);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (selectedOrder && orders.length > 0) {
            const updated = orders.find(o => o.id === selectedOrder.id);
            if (updated) setSelectedOrder(updated);
        }
    }, [orders]);

    const handlePay = async (orderId) => {
        setPayLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`/api/orders/${orderId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
            const data = await res.json();
            if (res.ok && data.payment?.snap_token) {
                if (window.snap) {
                    window.snap.pay(data.payment.snap_token, {
                        onSuccess: function () { fetchOrders(); },
                        onPending: function () { fetchOrders(); },
                        onError: function () { alert('Pembayaran gagal, silakan coba lagi.'); }
                    });
                } else if (data.payment.payment_url) {
                    window.open(data.payment.payment_url, '_blank');
                } else {
                    alert('Gagal memuat metode pembayaran Midtrans.');
                }
            } else {
                alert(data.message || 'Gagal mendapatkan token pembayaran.');
            }
        } catch (e) {
            alert('Kesalahan jaringan saat memproses pembayaran.');
        } finally {
            setPayLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleShipSimulate = async (orderId) => {
        setShipSimulateLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`/api/orders/${orderId}/ship-simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Simulasi pengiriman berhasil.');
                fetchOrders();
            } else {
                alert(data.message || 'Gagal mensimulasikan pengiriman.');
            }
        } catch (e) {
            alert('Kesalahan jaringan saat memproses simulasi pengiriman.');
        } finally {
            setShipSimulateLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const fetchOrderShipment = async (orderId) => {
        setTrackingLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/shipment`);
            if (res.ok) {
                const data = await res.json();
                setSelectedOrderTracking(data);
            } else {
                setSelectedOrderTracking(null);
            }
        } catch (e) {
            setSelectedOrderTracking(null);
        } finally {
            setTrackingLoading(false);
        }
    };

    useEffect(() => {
        if (selectedOrder) {
            if (selectedOrder.shipment) {
                fetchOrderShipment(selectedOrder.id);
            } else {
                setSelectedOrderTracking(null);
            }
        }
    }, [selectedOrder]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewOrder || !reviewProduct) return;
        setReviewLoading(true);
        setProfileError('');
        setProfileSuccess('');

        const formData = new FormData();
        formData.append('product_id', reviewProduct.product_id);
        formData.append('rating', reviewRating);
        formData.append('comment', reviewComment);
        if (reviewPhoto) formData.append('photo', reviewPhoto);

        try {
            const res = await fetch(`/api/orders/${reviewOrder.id}/reviews`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setProfileSuccess(data.message || 'Ulasan berhasil dikirim!');
                setIsReviewModalOpen(false);
                fetchOrders();
            } else {
                setProfileError(data.message || 'Gagal mengirim ulasan.');
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan.');
        } finally {
            setReviewLoading(false);
        }
    };

    const getFilteredOrders = () => {
        if (orderFilter === 'all') return orders;
        return orders.filter(o => o.status === orderFilter);
    };

    const getItemProductReview = (item) => {
        if (!selectedOrder || !selectedOrder.reviews) return null;
        const productId = item.productVariant?.product_id || item.product_id;
        return selectedOrder.reviews.find(r => parseInt(r.product_id) === parseInt(productId));
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'processing': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'shipping': return 'bg-violet-50 text-violet-700 border border-violet-200';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'cancelled': return 'bg-slate-100 text-slate-600 border border-slate-200';
            default: return 'bg-slate-50 text-slate-500';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Belum Bayar';
            case 'processing': return 'Sedang Diproses';
            case 'shipping': return 'Sedang Dikirim';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    return {
        orders,
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
        reviewOrder,
        setReviewOrder,
        reviewProduct,
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
    };
}
