import { useState, useEffect } from 'react';

export default function useCartDrawer({
    isOpen,
    cartItems,
    setSelectedVoucher,
    setVoucherDiscount,
    setSelectedShippingVoucher,
    setShippingDiscount
}) {
    const [vouchers, setVouchers] = useState([]);
    const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
    const [voucherInputCode, setVoucherInputCode] = useState('');
    const [voucherError, setVoucherError] = useState('');

    const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    useEffect(() => {
        if (isOpen) {
            fetch('/api/vouchers')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setVouchers(data);
                })
                .catch(err => console.error('Gagal mengambil data voucher:', err));
        }
    }, [isOpen]);

    const handleApplyVoucher = async (code) => {
        setVoucherError('');
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/api/vouchers/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ code, subtotal: totalPrice, shipping_cost: 0 })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal menerapkan voucher');
            }

            if (data.voucher.type === 'free_shipping') {
                setSelectedShippingVoucher(data.voucher);
                setShippingDiscount(0);
            } else {
                setSelectedVoucher(data.voucher);
                setVoucherDiscount(data.discount);
            }
            setShowVoucherDrawer(false);
            setVoucherInputCode('');
        } catch (err) {
            console.error(err);
            setVoucherError(err.message || 'Terjadi kesalahan saat menerapkan voucher');
        }
    };

    const handleRemoveVoucher = (type) => {
        if (type === 'free_shipping') {
            setSelectedShippingVoucher(null);
            setShippingDiscount(0);
        } else {
            setSelectedVoucher(null);
            setVoucherDiscount(0);
        }
    };

    return {
        vouchers,
        showVoucherDrawer,
        setShowVoucherDrawer,
        voucherInputCode,
        setVoucherInputCode,
        voucherError,
        totalItems,
        totalPrice,
        handleApplyVoucher,
        handleRemoveVoucher
    };
}
