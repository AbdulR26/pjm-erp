import { useState, useEffect } from 'react';

export default function useCartPage(cartItems, onCheckout, onRemoveItem) {
    // Track checked items. Key is item index or a unique key: `${item.product.id}-${item.variant}`
    const [checkedItems, setCheckedItems] = useState({});

    // Vouchers list and states
    const [vouchers, setVouchers] = useState([]);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherInputCode, setVoucherInputCode] = useState('');
    const [voucherError, setVoucherError] = useState('');

    // Pre-check all items on mount
    useEffect(() => {
        const initial = {};
        cartItems.forEach((item) => {
            const key = `${item.product.id}-${item.variant}`;
            initial[key] = true; // Default checked
        });
        setCheckedItems(initial);
    }, [cartItems.length]);

    // Fetch vouchers when page loads
    useEffect(() => {
        fetch('/api/vouchers')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setVouchers(data);
            })
            .catch(err => console.error('Gagal mengambil data voucher:', err));
    }, []);

    const getItemKey = (item) => `${item.product.id}-${item.variant}`;

    const handleToggleCheck = (item) => {
        const key = getItemKey(item);
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const isAllChecked = cartItems.length > 0 && cartItems.every(item => checkedItems[getItemKey(item)]);

    const handleToggleAll = () => {
        if (isAllChecked) {
            // Uncheck all
            setCheckedItems({});
        } else {
            // Check all
            const next = {};
            cartItems.forEach(item => {
                next[getItemKey(item)] = true;
            });
            setCheckedItems(next);
        }
    };

    // Calculate totals only for CHECKED items
    const checkedCartItems = cartItems.filter(item => checkedItems[getItemKey(item)]);
    const totalItemsCount = checkedCartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const checkedSubtotal = checkedCartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

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
                body: JSON.stringify({ code, subtotal: checkedSubtotal, shipping_cost: 0 })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal menerapkan voucher');
            }

            setSelectedVoucher(data.voucher);
            setVoucherDiscount(data.discount);
            setShowVoucherModal(false);
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

    // Recalculate discount if items are checked/unchecked or quantity changes
    useEffect(() => {
        if (selectedVoucher) {
            // Validate minimum spend
            if (checkedSubtotal < selectedVoucher.min_spend) {
                handleRemoveVoucher();
            } else {
                // Re-apply discount calculation
                let discount = 0;
                if (selectedVoucher.type === 'percent') {
                    discount = (checkedSubtotal * selectedVoucher.value) / 100;
                    if (selectedVoucher.max_discount && discount > selectedVoucher.max_discount) {
                        discount = selectedVoucher.max_discount;
                    }
                } else if (selectedVoucher.type === 'fixed') {
                    discount = selectedVoucher.value;
                }
                setVoucherDiscount(discount);
            }
        }
    }, [checkedSubtotal, selectedVoucher]);

    const handleCheckoutClick = () => {
        if (checkedCartItems.length === 0) return;
        // Trigger checkout in parent passing only the checked items & selected voucher info
        onCheckout(checkedCartItems, {
            voucher: selectedVoucher,
            discount: voucherDiscount
        });
    };

    const handleBulkDelete = () => {
        if (checkedCartItems.length === 0) return;
        if (confirm('Hapus semua produk terpilih dari keranjang?')) {
            checkedCartItems.forEach(item => {
                onRemoveItem(item.product, item.variant);
            });
        }
    };

    return {
        checkedItems,
        isAllChecked,
        checkedCartItems,
        totalItemsCount,
        checkedSubtotal,
        vouchers,
        showVoucherModal,
        setShowVoucherModal,
        selectedVoucher,
        voucherDiscount,
        voucherInputCode,
        setVoucherInputCode,
        voucherError,
        getItemKey,
        handleToggleCheck,
        handleToggleAll,
        handleApplyVoucher,
        handleRemoveVoucher,
        handleCheckoutClick,
        handleBulkDelete
    };
}
