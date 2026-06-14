import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, ShieldCheck, Wallet, ChevronRight, Check, X, Copy, QrCode, CreditCard, Tag, Store } from 'lucide-react';

const COURIERS = [
    { id: 'jnt',         name: 'J&T Express',       service: 'Reguler',              price: 12000, eta: '2-3 hari' },
    { id: 'jne',         name: 'JNE Express',        service: 'Reguler',              price: 15000, eta: '2-4 hari' },
    { id: 'sicepat',     name: 'SiCepat Halu',       service: 'Hemat',                price: 9000,  eta: '3-5 hari' },
    { id: 'pjm_instant', name: 'PJM Instant Kurir',  service: 'Instant (Surabaya)',   price: 25000, eta: 'Hari ini' },
];


export default function CheckoutPage({ cart, onBack, onOrderSuccess, currentUser, settings }) {
    const [selectedCourier, setSelectedCourier]   = useState(COURIERS[0]);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState(() => ({
        name:   currentUser?.name || '',
        phone:  '',
        detail: '',
    }));
    const [tempAddress, setTempAddress] = useState({ ...address });

    const [loading,       setLoading]       = useState(false);


    const [vouchers,          setVouchers]          = useState([]);
    const [selectedVoucher,   setSelectedVoucher]   = useState(null);
    const [voucherDiscount,   setVoucherDiscount]   = useState(0);
    const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
    const [voucherInputCode,  setVoucherInputCode]  = useState('');
    const [voucherError,      setVoucherError]      = useState('');

    useEffect(() => {
        if (!settings) return;
        const isProduction = settings.midtrans_is_production === '1' || settings.midtrans_is_production === true || settings.midtrans_is_production === 'true';
        const clientKey = settings.midtrans_client_key || 'SB-Mid-client-SQ4TW_FBC4Xy618R';
        const snapSrcUrl = isProduction 
            ? 'https://app.midtrans.com/snap/snap.js' 
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        // Check if script is already added
        let script = document.querySelector(`script[src="${snapSrcUrl}"]`);
        if (!script) {
            script = document.createElement('script');
            script.src = snapSrcUrl;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, [settings]);

    useEffect(() => {
        fetch('/api/vouchers')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setVouchers(data);
            })
            .catch(err => console.error('Gagal mengambil data voucher:', err));
    }, []);

    const subtotal      = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
    const shippingFee   = selectedCourier.price;
    const total         = Math.max(0, subtotal + shippingFee - voucherDiscount);

    const handleSaveAddress = (e) => {
        e.preventDefault();
        setAddress({ ...tempAddress });
        setIsEditingAddress(false);
    };

    const handleApplyVoucher = async (code) => {
        setVoucherError('');
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
            const response = await fetch('/api/vouchers/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ code, subtotal })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal menerapkan voucher');
            }

            setSelectedVoucher(data.voucher);
            setVoucherDiscount(data.discount);
            setShowVoucherDrawer(false);
            setVoucherInputCode('');
        } catch (err) {
            console.error(err);
            setVoucherError(err.message || 'Terjadi kesalahan saat menerapkan voucher');
        }
    };

    const handleRemoveVoucher = () => {
        setSelectedVoucher(null);
        setVoucherDiscount(0);
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
            const items = cart.map(item => ({
                product_id: item.product.id,
                variant_name: item.variant,
                quantity: item.quantity
            }));

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    address,
                    items,
                    courier: selectedCourier,
                    notes: '',
                    voucher_code: selectedVoucher ? selectedVoucher.code : null
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal membuat pesanan');
            }

            const snapToken = data.order?.payment?.snap_token;
            if (snapToken && window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function (result) {
                        console.log('Payment success:', result);
                        onOrderSuccess({
                            address, items: cart, courier: selectedCourier,
                            subtotal, shipping: shippingFee, total,
                            paymentMethod: 'Midtrans VA/QRIS',
                            order_number: data.order.order_number,
                            discount: voucherDiscount,
                            voucher_code: selectedVoucher ? selectedVoucher.code : null
                        });
                    },
                    onPending: function (result) {
                        console.log('Payment pending:', result);
                        onOrderSuccess({
                            address, items: cart, courier: selectedCourier,
                            subtotal, shipping: shippingFee, total,
                            paymentMethod: 'Midtrans VA/QRIS',
                            order_number: data.order.order_number,
                            discount: voucherDiscount,
                            voucher_code: selectedVoucher ? selectedVoucher.code : null
                        });
                    },
                    onError: function (result) {
                        console.error('Payment error:', result);
                        alert('Pembayaran gagal, silakan coba lagi.');
                    },
                    onClose: function () {
                        console.log('Payment popup closed');
                        alert('Silakan selesaikan pembayaran Anda di halaman profil.');
                        onOrderSuccess({
                            address, items: cart, courier: selectedCourier,
                            subtotal, shipping: shippingFee, total,
                            paymentMethod: 'Midtrans VA/QRIS',
                            order_number: data.order.order_number,
                            discount: voucherDiscount,
                            voucher_code: selectedVoucher ? selectedVoucher.code : null
                        });
                    }
                });
            } else if (data.order?.payment?.payment_url) {
                window.open(data.order.payment.payment_url, '_blank');
                onOrderSuccess({
                    address, items: cart, courier: selectedCourier,
                    subtotal, shipping: shippingFee, total,
                    paymentMethod: 'Midtrans VA/QRIS',
                    order_number: data.order.order_number,
                    discount: voucherDiscount,
                    voucher_code: selectedVoucher ? selectedVoucher.code : null
                });
            } else {
                alert('Gagal memuat metode pembayaran Midtrans.');
            }

        } catch (err) {
            console.error(err);
            alert(err.message || 'Terjadi kesalahan saat membuat pesanan');
        } finally {
            setLoading(false);
        }
    };

    const addressFilled = address.name && address.phone && address.detail;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .scp * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
                @keyframes scp-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scp-modal { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .scp-wrap { animation: scp-fadein 0.3s ease; }

                /* Page layout */
                .scp-page { background: #f5f5f5; min-height: 60vh; padding: 0 0 40px; }

                /* Topbar */
                .scp-topbar {
                    background: #fff; padding: 12px 0;
                    border-bottom: 1px solid #f0f0f0; margin-bottom: 8px;
                    display: flex; align-items: center; gap: 12px;
                }
                .scp-back-btn {
                    display: flex; align-items: center; gap: 5px;
                    background: none; border: none; cursor: pointer;
                    font-size: 13px; font-weight: 600; color: #555;
                    font-family: 'Inter', sans-serif; transition: color 0.14s;
                }
                .scp-back-btn:hover { color: #c0001a; }
                .scp-topbar-title {
                    font-size: 16px; font-weight: 700; color: #222;
                }
                .scp-topbar-badge {
                    margin-left: auto;
                    display: flex; align-items: center; gap: 6px;
                    background: #f5fff8; border: 1px solid #d1f0de;
                    border-radius: 20px; padding: 3px 10px;
                    font-size: 11px; font-weight: 600; color: #2e7d4a;
                }

                /* Section cards */
                .scp-card {
                    background: #fff; margin-bottom: 8px;
                    border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
                }
                .scp-card-header {
                    padding: 14px 16px 10px;
                    display: flex; align-items: center; gap: 8px;
                    border-bottom: 1px solid #f5f5f5;
                }
                .scp-card-title {
                    font-size: 13px; font-weight: 700; color: #222;
                }
                .scp-card-body { padding: 12px 16px 14px; }

                /* Address */
                .scp-addr-filled {
                    display: flex; align-items: flex-start; gap: 10px;
                }
                .scp-addr-dot {
                    width: 10px; height: 10px; border-radius: 50%;
                    background: #c0001a; flex-shrink: 0; margin-top: 4px;
                }
                .scp-addr-name { font-size: 13px; font-weight: 700; color: #222; }
                .scp-addr-phone { font-size: 12px; color: #888; font-weight: 500; margin-left: 8px; }
                .scp-addr-detail { font-size: 12px; color: #555; margin-top: 3px; line-height: 1.5; }
                .scp-addr-change {
                    background: none; border: 1px solid #c0001a;
                    color: #c0001a; font-size: 11.5px; font-weight: 600;
                    padding: 3px 10px; border-radius: 2px; cursor: pointer;
                    margin-left: auto; flex-shrink: 0;
                    font-family: 'Inter', sans-serif; transition: background 0.14s;
                }
                .scp-addr-change:hover { background: #fff5f5; }

                .scp-input {
                    width: 100%; padding: 10px 12px;
                    border: 1px solid #e0e0e0; border-radius: 3px;
                    font-size: 13px; font-weight: 500; color: #222;
                    font-family: 'Inter', sans-serif; outline: none;
                    transition: border-color 0.14s;
                }
                .scp-input:focus { border-color: #c0001a; }
                .scp-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
                .scp-save-btn {
                    background: #c0001a; color: #fff; border: none;
                    padding: 9px 20px; border-radius: 3px; font-size: 13px;
                    font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
                    transition: background 0.14s;
                }
                .scp-save-btn:hover { background: #a30016; }
                .scp-cancel-btn {
                    background: none; border: 1px solid #e0e0e0;
                    color: #666; padding: 9px 20px; border-radius: 3px;
                    font-size: 13px; font-weight: 700; cursor: pointer;
                    font-family: 'Inter', sans-serif; margin-left: 8px;
                    transition: background 0.14s;
                }
                .scp-cancel-btn:hover { background: #f5f5f5; }

                /* Products */
                .scp-product-row {
                    display: flex; align-items: flex-start; gap: 10px;
                    padding: 10px 0; border-bottom: 1px solid #f5f5f5;
                }
                .scp-product-row:last-child { border-bottom: none; padding-bottom: 0; }
                .scp-prod-img {
                    width: 60px; height: 60px; border-radius: 3px;
                    overflow: hidden; flex-shrink: 0; border: 1px solid #eee;
                }
                .scp-prod-img img { width: 100%; height: 100%; object-fit: cover; }
                .scp-prod-name { font-size: 13px; font-weight: 500; color: #222; line-height: 1.4; }
                .scp-prod-variant {
                    font-size: 11px; color: #888; background: #f5f5f5;
                    padding: 1px 6px; border-radius: 2px; margin-top: 4px;
                    display: inline-block;
                }
                .scp-prod-qty { font-size: 11.5px; color: #888; margin-top: 4px; }
                .scp-prod-price { font-size: 14px; font-weight: 700; color: #c0001a; margin-left: auto; flex-shrink: 0; }

                /* Courier */
                .scp-courier-option {
                    display: flex; align-items: center;
                    padding: 10px 12px; border: 1.5px solid #e0e0e0;
                    border-radius: 3px; cursor: pointer; margin-bottom: 8px;
                    transition: all 0.14s; background: #fff;
                }
                .scp-courier-option:last-child { margin-bottom: 0; }
                .scp-courier-option.active {
                    border-color: #c0001a;
                    background: #fff9f9;
                }
                .scp-courier-radio {
                    width: 16px; height: 16px; border-radius: 50%;
                    border: 2px solid #ddd; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    margin-right: 10px; transition: border-color 0.14s;
                }
                .scp-courier-option.active .scp-courier-radio {
                    border-color: #c0001a;
                }
                .scp-courier-dot {
                    width: 8px; height: 8px; border-radius: 50%; background: #c0001a;
                }
                .scp-courier-name { font-size: 13px; font-weight: 600; color: #222; }
                .scp-courier-service { font-size: 11px; color: #888; margin-top: 2px; }
                .scp-courier-eta {
                    font-size: 10.5px; color: #2e7d4a; background: #f5fff8;
                    border-radius: 2px; padding: 1px 5px; margin-top: 2px;
                    font-weight: 600; display: inline-block;
                }
                .scp-courier-price { margin-left: auto; font-size: 13px; font-weight: 700; color: #c0001a; }



                /* Right panel (summary) */
                .scp-summary-card {
                    background: #fff; border-top: 1px solid #f0f0f0;
                    border-bottom: 1px solid #f0f0f0; padding: 14px 16px;
                }
                .scp-sum-row {
                    display: flex; justify-content: space-between;
                    font-size: 13px; color: #666; margin-bottom: 8px;
                }
                .scp-sum-total {
                    display: flex; justify-content: space-between;
                    align-items: center; padding-top: 10px;
                    border-top: 1px solid #f0f0f0; margin-top: 2px;
                }
                .scp-sum-total-label { font-size: 14px; font-weight: 700; color: #222; }
                .scp-sum-total-val { font-size: 20px; font-weight: 800; color: #c0001a; }

                .scp-sticky-bar {
                    background: #fff; border-top: 1px solid #f0f0f0;
                    padding: 12px 16px;
                    display: flex; align-items: center; gap: 12px;
                    position: sticky; bottom: 0; margin-top: 8px;
                }
                .scp-sticky-total { flex: 1; }
                .scp-sticky-label { font-size: 11px; color: #888; }
                .scp-sticky-val { font-size: 18px; font-weight: 800; color: #c0001a; }
                .scp-order-btn {
                    background: #c0001a; color: #fff; border: none;
                    padding: 14px 24px; border-radius: 3px; font-size: 14px;
                    font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
                    transition: background 0.15s; white-space: nowrap;
                }
                .scp-order-btn:hover { background: #a30016; }
                .scp-order-btn:disabled {
                    background: #e0e0e0; color: #aaa; cursor: not-allowed;
                }

                /* Midtrans Modal */
                .mid-backdrop {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(0,0,0,0.6); display: flex;
                    align-items: center; justify-content: center; padding: 16px;
                }
                .mid-modal {
                    background: #fff; border-radius: 6px; width: 100%; max-width: 380px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.25); overflow: hidden;
                    display: flex; flex-direction: column;
                    animation: scp-modal 0.22s ease;
                }
                .mid-header {
                    background: #1a1a2e; padding: 14px 16px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .mid-logo { display: flex; align-items: center; gap: 8px; }
                .mid-logo-box {
                    width: 28px; height: 28px; background: #4361ee;
                    border-radius: 6px; display: flex; align-items: center;
                    justify-content: center; font-size: 12px; font-weight: 900;
                    color: #fff;
                }
                .mid-logo-name { font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
                .mid-logo-store { font-size: 10px; color: #aaa; margin-top: 1px; }
                .mid-close { background: none; border: none; color: #888; cursor: pointer; }
                .mid-close:hover { color: #fff; }

                .mid-amount-bar {
                    background: #f8f8f8; padding: 12px 16px;
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #f0f0f0;
                }
                .mid-amount-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
                .mid-amount-val { font-size: 18px; font-weight: 800; color: #222; margin-top: 2px; }
                .mid-order-id { font-size: 10px; color: #888; font-weight: 600; }

                .mid-body { padding: 16px; flex: 1; overflow-y: auto; max-height: 360px; min-height: 200px; }
                .mid-section-label {
                    font-size: 10px; font-weight: 700; color: #aaa;
                    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px;
                }
                .mid-method-btn {
                    width: 100%; display: flex; align-items: center; gap: 10px;
                    padding: 12px; border: 1.5px solid #e8e8e8; border-radius: 4px;
                    background: #fff; cursor: pointer; margin-bottom: 8px;
                    transition: all 0.14s; font-family: 'Inter', sans-serif;
                    font-size: 13px; font-weight: 600; color: #222; text-align: left;
                }
                .mid-method-btn:hover { border-color: #4361ee; background: #f8f9ff; }
                .mid-method-icon {
                    width: 32px; height: 32px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .mid-method-arrow { margin-left: auto; color: #bbb; }

                .mid-pay-btn {
                    width: 100%; background: #2e7d4a; color: #fff;
                    border: none; border-radius: 4px; padding: 12px;
                    font-size: 13px; font-weight: 700; cursor: pointer;
                    font-family: 'Inter', sans-serif; transition: background 0.14s;
                    margin-top: 8px;
                }
                .mid-pay-btn:hover { background: #256040; }
                .mid-back-link {
                    display: block; text-align: center; margin-top: 8px;
                    font-size: 12px; color: #888; font-weight: 600;
                    cursor: pointer; background: none; border: none;
                    font-family: 'Inter', sans-serif; width: 100%;
                }
                .mid-back-link:hover { color: #444; text-decoration: underline; }

                .mid-footer {
                    background: #f8f8f8; border-top: 1px solid #f0f0f0;
                    padding: 10px 16px; text-align: center;
                    font-size: 10px; color: #aaa; font-weight: 600;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                }

                /* QR mock */
                .mid-qr-box {
                    width: 140px; height: 140px; border: 1px solid #e0e0e0;
                    border-radius: 6px; padding: 8px; background: #fff;
                    display: grid; grid-template-columns: repeat(6,1fr); gap: 2px;
                    margin: 0 auto;
                }
                .mid-qr-cell { border-radius: 1px; }

                /* VA box */
                .mid-va-box {
                    background: #f8f8f8; border: 1px solid #e0e0e0;
                    border-radius: 4px; padding: 14px; text-align: center;
                    position: relative;
                }
                .mid-va-label { font-size: 10px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                .mid-va-number { font-size: 20px; font-weight: 800; color: #222; letter-spacing: 1.5px; }
                .mid-copy-btn {
                    background: none; border: none; cursor: pointer; color: #4361ee;
                    margin-left: 8px; vertical-align: middle;
                }

                /* Success */
                .mid-success-icon {
                    width: 64px; height: 64px; background: #f0fff6;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; margin: 0 auto 12px;
                }

                /* Bank buttons */
                .mid-bank-btn {
                    width: 100%; display: flex; align-items: center; justify-content: space-between;
                    padding: 11px 12px; border: 1.5px solid #e8e8e8; border-radius: 4px;
                    background: #fff; cursor: pointer; margin-bottom: 8px;
                    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
                    color: #222; transition: all 0.14s;
                }
                .mid-bank-btn:hover { border-color: #4361ee; background: #f8f9ff; }

                /* Voucher Drawer */
                .vch-drawer-backdrop {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(0,0,0,0.5); display: flex;
                    justify-content: flex-end;
                }
                .vch-drawer {
                    background: #fff; width: 100%; max-width: 420px;
                    height: 100%; display: flex; flex-direction: column;
                    box-shadow: -5px 0 25px rgba(0,0,0,0.15);
                    animation: vch-slide 0.26s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                @keyframes vch-slide {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .vch-drawer-header {
                    padding: 16px; border-bottom: 1px solid #f0f0f0;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .vch-drawer-title { font-size: 15px; font-weight: 700; color: #222; }
                .vch-drawer-body { padding: 16px; flex: 1; overflow-y: auto; }
                .vch-promo-input-box {
                    display: flex; gap: 8px; margin-bottom: 16px;
                }
                .vch-btn-apply {
                    background: #c0001a; color: #fff; border: none;
                    padding: 0 16px; border-radius: 3px; font-size: 13px;
                    font-weight: 700; cursor: pointer; transition: background 0.14s;
                }
                .vch-btn-apply:hover { background: #a30016; }
                .vch-card {
                    border: 1.5px solid #f0f0f0; border-radius: 6px;
                    padding: 12px; margin-bottom: 12px; display: flex;
                    align-items: center; justify-content: space-between;
                    background: #fff; transition: border-color 0.14s;
                }
                .vch-card.selected {
                    border-color: #c0001a; background: #fffcfc;
                }
                .vch-info { flex: 1; margin-right: 12px; }
                .vch-code-badge {
                    background: #fff0f0; color: #c0001a;
                    font-size: 10px; font-weight: 800; padding: 2px 6px;
                    border-radius: 3px; display: inline-block; margin-bottom: 6px;
                    border: 0.5px solid #ffcccc;
                }
                .vch-name { font-size: 13px; font-weight: 700; color: #222; }
                .vch-desc { font-size: 11px; color: #666; margin-top: 3px; }
                .vch-min { font-size: 10px; color: #888; margin-top: 4px; }
                .vch-select-btn {
                    border: 1px solid #c0001a; color: #c0001a;
                    background: none; font-size: 12px; font-weight: 700;
                    padding: 5px 12px; border-radius: 3px; cursor: pointer;
                    transition: all 0.14s;
                }
                .vch-select-btn:hover { background: #c0001a; color: #fff; }
                .vch-select-btn.active {
                    background: #c0001a; color: #fff;
                }
                .vch-select-btn:disabled {
                    border-color: #ddd; color: #aaa; cursor: not-allowed;
                }
            `}</style>

            <div className="scp scp-wrap scp-page">
                {/* Top Bar */}
                <div className="scp-card" style={{ marginBottom: 8, padding: 0 }}>
                    <div className="scp-topbar" style={{ padding: '12px 16px' }}>
                        <button className="scp-back-btn" onClick={onBack}>
                            <ArrowLeft size={15} />
                            <span>Kembali</span>
                        </button>
                        <span className="scp-topbar-title">Checkout</span>
                        {currentUser && (
                            <div className="scp-topbar-badge">
                                {currentUser.avatar && (
                                    <img src={currentUser.avatar} alt="" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                                )}
                                <span>{currentUser.name?.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, alignItems: 'start' }}>
                    {/* LEFT: Details */}
                    <div style={{ gridColumn: 'span 2' }}>

                        {/* 1. Address */}
                        <div className="scp-card">
                            <div className="scp-card-header">
                                <MapPin size={16} color="#c0001a" />
                                <span className="scp-card-title">Alamat Pengiriman</span>
                            </div>
                            <div className="scp-card-body">
                                {isEditingAddress ? (
                                    <form onSubmit={handleSaveAddress}>
                                        <div className="scp-input-grid">
                                            <input
                                                className="scp-input"
                                                required placeholder="Nama Penerima"
                                                value={tempAddress.name}
                                                onChange={e => setTempAddress({ ...tempAddress, name: e.target.value })}
                                            />
                                            <input
                                                className="scp-input"
                                                required placeholder="Nomor Telepon"
                                                value={tempAddress.phone}
                                                onChange={e => setTempAddress({ ...tempAddress, phone: e.target.value })}
                                            />
                                        </div>
                                        <textarea
                                            className="scp-input"
                                            required rows={2}
                                            placeholder="Detail Alamat Lengkap (Jalan, Kecamatan, Kota)"
                                            style={{ resize: 'none', marginBottom: 10 }}
                                            value={tempAddress.detail}
                                            onChange={e => setTempAddress({ ...tempAddress, detail: e.target.value })}
                                        />
                                        <div>
                                            <button type="submit" className="scp-save-btn">Simpan Alamat</button>
                                            <button
                                                type="button"
                                                className="scp-cancel-btn"
                                                onClick={() => { setTempAddress({ ...address }); setIsEditingAddress(false); }}
                                            >Batal</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="scp-addr-filled">
                                        <div className="scp-addr-dot" />
                                        <div style={{ flex: 1 }}>
                                            <div>
                                                <span className="scp-addr-name">{address.name || '—'}</span>
                                                {address.phone && <span className="scp-addr-phone">({address.phone})</span>}
                                            </div>
                                            <div className="scp-addr-detail">{address.detail || <span style={{ color: '#c0001a', fontSize: 12 }}>Alamat belum diisi</span>}</div>
                                        </div>
                                        <button className="scp-addr-change" onClick={() => setIsEditingAddress(true)}>Ubah</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Products */}
                        <div className="scp-card">
                            <div className="scp-card-header">
                                <Store size={16} color="#c0001a" />
                                <span className="scp-card-title">Produk Dipesan</span>
                            </div>
                            <div className="scp-card-body">
                                {cart.map((item, i) => (
                                    <div key={i} className="scp-product-row">
                                        <div className="scp-prod-img">
                                            <img src={item.product.image} alt={item.product.name} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="scp-prod-name">{item.product.name}</div>
                                            <span className="scp-prod-variant">Varian: {item.variant}</span>
                                            <div className="scp-prod-qty">x{item.quantity}</div>
                                        </div>
                                        <div className="scp-prod-price">
                                            Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Courier */}
                        <div className="scp-card">
                            <div className="scp-card-header">
                                <Truck size={16} color="#c0001a" />
                                <span className="scp-card-title">Pilih Pengiriman</span>
                            </div>
                            <div className="scp-card-body">
                                {COURIERS.map(cour => (
                                    <button
                                        key={cour.id}
                                        className={`scp-courier-option ${selectedCourier.id === cour.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCourier(cour)}
                                        style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                                    >
                                        <div className="scp-courier-radio">
                                            {selectedCourier.id === cour.id && <div className="scp-courier-dot" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="scp-courier-name">{cour.name}</div>
                                            <div className="scp-courier-service">{cour.service}</div>
                                            <span className="scp-courier-eta">Estimasi {cour.eta}</span>
                                        </div>
                                        <div className="scp-courier-price">Rp {cour.price.toLocaleString('id-ID')}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Payment Method */}
                        <div className="scp-card">
                            <div className="scp-card-header">
                                <Wallet size={16} color="#c0001a" />
                                <span className="scp-card-title">Metode Pembayaran</span>
                            </div>
                            <div className="scp-card-body">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '14px 16px',
                                    border: '1.5px solid #c0001a',
                                    borderRadius: '4px',
                                    background: '#fff9f9'
                                }}>
                                    <div style={{
                                        background: '#c0001a',
                                        color: '#fff',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Wallet size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>Midtrans Payment</div>
                                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Bayar Instan & Aman (VA / QRIS / Kartu Kredit)</div>
                                    </div>
                                    <Check size={16} color="#c0001a" style={{ marginLeft: 'auto' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Summary (shown inline on mobile, right col on desktop) */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <div className="scp-summary-card" style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 12 }}>Ringkasan Belanja</div>
                            <div className="scp-sum-row">
                                <span>Subtotal Produk</span>
                                <span style={{ color: '#222', fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="scp-sum-row">
                                <span>Biaya Pengiriman</span>
                                <span style={{ color: '#222', fontWeight: 600 }}>Rp {shippingFee.toLocaleString('id-ID')}</span>
                            </div>
                             <div className="scp-sum-row" style={{ marginBottom: 0 }}>
                                 <span>Diskon Voucher</span>
                                 <span style={{ color: '#c0001a', fontWeight: 600 }}>- Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                             </div>
                            <div className="scp-sum-total">
                                <span className="scp-sum-total-label">Total Pembayaran</span>
                                <span className="scp-sum-total-val">Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {/* Voucher hint */}
                        <div 
                            className="scp-card" 
                            style={{ 
                                padding: '12px 16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 8, 
                                cursor: 'pointer', 
                                marginBottom: 8,
                                borderLeft: selectedVoucher ? '3px solid #c0001a' : ''
                            }}
                            onClick={() => setShowVoucherDrawer(true)}
                        >
                            <Tag size={15} color="#c0001a" />
                            <div style={{ flex: 1 }}>
                                {selectedVoucher ? (
                                    <>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#c0001a' }}>
                                            Voucher Digunakan: {selectedVoucher.code}
                                        </span>
                                        <div style={{ fontSize: 11, color: '#2e7d4a', fontWeight: 600, marginTop: 2 }}>
                                            Hemat Rp {voucherDiscount.toLocaleString('id-ID')}
                                        </div>
                                    </>
                                ) : (
                                    <span style={{ fontSize: 12.5, color: '#555', fontWeight: 600 }}>
                                        Gunakan Voucher / Promo
                                    </span>
                                )}
                            </div>
                            {selectedVoucher ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveVoucher(); }}
                                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                    Batal
                                </button>
                            ) : (
                                <ChevronRight size={13} color="#bbb" style={{ marginLeft: 'auto' }} />
                            )}
                        </div>

                        {/* Shield note */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 16px', background: '#fff', fontSize: 11, color: '#888',
                            borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', marginBottom: 8
                        }}>
                            <ShieldCheck size={13} color="#2e7d4a" />
                            <span>Transaksi dijamin aman & terenkripsi</span>
                        </div>
                    </div>
                </div>

                {/* Sticky bottom bar */}
                <div className="scp-card scp-sticky-bar">
                    <div className="scp-sticky-total">
                        <div className="scp-sticky-label">Total Pembayaran</div>
                        <div className="scp-sticky-val">Rp {total.toLocaleString('id-ID')}</div>
                    </div>
                    <button
                        className="scp-order-btn"
                        onClick={handlePlaceOrder}
                        disabled={!addressFilled || loading}
                        title={!addressFilled ? 'Lengkapi alamat pengiriman terlebih dahulu' : ''}
                    >
                        {loading ? 'Membuat Pesanan...' : (!addressFilled ? 'Isi Alamat Dulu' : 'Buat Pesanan')}
                    </button>
                </div>
            </div>


            {/* ── Voucher Drawer ── */}
            {showVoucherDrawer && (
                <div className="vch-drawer-backdrop" onClick={() => setShowVoucherDrawer(false)}>
                    <div className="vch-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="vch-drawer-header">
                            <span className="vch-drawer-title">Voucher Toko</span>
                            <button className="mid-close" onClick={() => setShowVoucherDrawer(false)}>
                                <X size={18} color="#222" />
                            </button>
                        </div>
                        <div className="vch-drawer-body">
                            {/* Input Code */}
                            <div className="vch-promo-input-box">
                                <input 
                                    className="scp-input" 
                                    placeholder="Masukkan kode voucher"
                                    value={voucherInputCode}
                                    onChange={(e) => setVoucherInputCode(e.target.value.toUpperCase())}
                                />
                                <button 
                                    className="vch-btn-apply"
                                    onClick={() => handleApplyVoucher(voucherInputCode)}
                                    disabled={!voucherInputCode}
                                >
                                    Pakai
                                </button>
                            </div>

                            {voucherError && (
                                <div style={{ color: '#c0001a', fontSize: 11.5, fontWeight: 600, marginBottom: 12 }}>
                                    ⚠️ {voucherError}
                                </div>
                            )}

                            <div style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 12 }}>
                                Voucher Tersedia
                            </div>

                            {vouchers.length === 0 ? (
                                <div style={{ fontSize: 12, color: '#888', textAlign: 'center', padding: '24px 0' }}>
                                    Tidak ada voucher yang tersedia saat ini.
                                </div>
                            ) : (
                                vouchers.map((vch) => {
                                    const isDisabled = subtotal < vch.min_spend;
                                    const isSelected = selectedVoucher && selectedVoucher.id === vch.id;
                                    return (
                                        <div key={vch.id} className={`vch-card ${isSelected ? 'selected' : ''}`} style={{ opacity: isDisabled ? 0.6 : 1 }}>
                                            <div className="vch-info">
                                                <span className="vch-code-badge">{vch.code}</span>
                                                <div className="vch-name">
                                                    {vch.type === 'percent' 
                                                        ? `Diskon ${vch.value}%` 
                                                        : `Potongan Rp ${vch.value.toLocaleString('id-ID')}`}
                                                </div>
                                                <div className="vch-desc">
                                                    {vch.type === 'percent' && vch.max_discount
                                                        ? `Maksimal potongan Rp ${vch.max_discount.toLocaleString('id-ID')}`
                                                        : 'Diskon langsung tanpa batas maksimal'}
                                                </div>
                                                <div className="vch-min">
                                                    Min. Belanja Rp {vch.min_spend.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                            <button 
                                                className={`vch-select-btn ${isSelected ? 'active' : ''}`}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        handleRemoveVoucher();
                                                    } else {
                                                        setSelectedVoucher(vch);
                                                        // calculate discount on the fly
                                                        let disc = 0;
                                                        if (vch.type === 'percent') {
                                                            disc = subtotal * (vch.value / 100);
                                                            if (vch.max_discount && disc > vch.max_discount) disc = vch.max_discount;
                                                        } else {
                                                            disc = Math.min(vch.value, subtotal);
                                                        }
                                                        setVoucherDiscount(disc);
                                                        setShowVoucherDrawer(false);
                                                    }
                                                }}
                                            >
                                                {isSelected ? 'Terpakai' : 'Klaim'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
