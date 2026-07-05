import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export default function useOrderSummary({
    subtotal,
    shippingFee,
    selectedVoucher,
    selectedShippingVoucher,
    setSelectedVoucher,
    setSelectedShippingVoucher,
    setVoucherDiscount,
    setShippingDiscount,
    onVoucherChange,
    onShippingVoucherChange
}) {
    const [vouchers, setVouchers] = useState([]);
    const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
    const [voucherInputCode, setVoucherInputCode] = useState('');
    const [voucherError, setVoucherError] = useState('');

    useEffect(() => {
        fetch('/api/vouchers')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setVouchers(data);
            })
            .catch(err => console.error('Gagal mengambil data voucher:', err));
    }, []);

    const handleApplyVoucher = async (code) => {
        setVoucherError('');
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/api/vouchers/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ code, subtotal, shipping_cost: shippingFee })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal menerapkan voucher');
            }

            if (data.voucher.type === 'free_shipping') {
                const calculatedShippingDisc = Math.min(data.voucher.value, shippingFee);
                setSelectedShippingVoucher(data.voucher);
                setShippingDiscount(calculatedShippingDisc);
                if (onShippingVoucherChange) onShippingVoucherChange(data.voucher, calculatedShippingDisc);
            } else {
                setSelectedVoucher(data.voucher);
                setVoucherDiscount(data.discount);
                if (onVoucherChange) onVoucherChange(data.voucher, data.discount);
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
            if (onShippingVoucherChange) onShippingVoucherChange(null, 0);
        } else {
            setSelectedVoucher(null);
            setVoucherDiscount(0);
            if (onVoucherChange) onVoucherChange(null, 0);
        }
    };

    return {
        vouchers,
        showVoucherDrawer,
        setShowVoucherDrawer,
        voucherInputCode,
        setVoucherInputCode,
        voucherError,
        handleApplyVoucher,
        handleRemoveVoucher
    };
}
