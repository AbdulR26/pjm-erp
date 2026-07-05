import { useState, useEffect } from 'react';

export function useVouchers(cart) {
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [selectedShippingVoucher, setSelectedShippingVoucher] = useState(null);
    const [shippingDiscount, setShippingDiscount] = useState(0);

    // Auto-validate vouchers when cart updates
    useEffect(() => {
        const subtotal = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);

        if (selectedVoucher) {
            if (subtotal < selectedVoucher.min_spend) {
                setSelectedVoucher(null);
                setVoucherDiscount(0);
                alert(`Voucher diskon ${selectedVoucher.code} dilepas karena minimum belanja tidak terpenuhi.`);
            } else {
                let disc = 0;
                if (selectedVoucher.type === 'percent') {
                    disc = subtotal * (selectedVoucher.value / 100);
                    if (selectedVoucher.max_discount && disc > selectedVoucher.max_discount) {
                        disc = selectedVoucher.max_discount;
                    }
                } else {
                    disc = Math.min(selectedVoucher.value, subtotal);
                }
                setVoucherDiscount(disc);
            }
        }

        if (selectedShippingVoucher) {
            if (subtotal < selectedShippingVoucher.min_spend) {
                setSelectedShippingVoucher(null);
                setShippingDiscount(0);
                alert(`Voucher gratis ongkir ${selectedShippingVoucher.code} dilepas karena minimum belanja tidak terpenuhi.`);
            } else {
                setShippingDiscount(selectedShippingVoucher.value);
            }
        }
    }, [cart, selectedVoucher, selectedShippingVoucher]);

    return {
        selectedVoucher,
        setSelectedVoucher,
        voucherDiscount,
        setVoucherDiscount,
        selectedShippingVoucher,
        setSelectedShippingVoucher,
        shippingDiscount,
        setShippingDiscount
    };
}
