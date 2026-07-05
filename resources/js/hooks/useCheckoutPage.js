import { useState, useEffect } from 'react';
import { getCsrfToken, loadMidtransSnap } from '../utils/helpers';

export default function useCheckoutPage({
    cart,
    onOrderSuccess,
    currentUser,
    settings,
    initialSelectedVoucher,
    initialVoucherDiscount,
    initialSelectedShippingVoucher,
    initialShippingDiscount
}) {
    const [address, setAddress] = useState(() => ({
        name:   currentUser?.name || '',
        phone:  currentUser?.phone || '',
        detail: currentUser?.address || '',
        postal_code: currentUser?.postal_code || '',
        latitude: currentUser?.latitude || '',
        longitude: currentUser?.longitude || '',
    }));
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);

    const [selectedCourier, setSelectedCourier] = useState(null);
    const [loading, setLoading] = useState(false);

    const [selectedVoucher, setSelectedVoucher] = useState(initialSelectedVoucher);
    const [voucherDiscount, setVoucherDiscount] = useState(initialVoucherDiscount);
    const [selectedShippingVoucher, setSelectedShippingVoucher] = useState(initialSelectedShippingVoucher);
    const [shippingDiscount, setShippingDiscount] = useState(initialShippingDiscount);

    useEffect(() => {
        setSelectedVoucher(initialSelectedVoucher);
        setVoucherDiscount(initialVoucherDiscount);
    }, [initialSelectedVoucher, initialVoucherDiscount]);

    useEffect(() => {
        setSelectedShippingVoucher(initialSelectedShippingVoucher);
        setShippingDiscount(initialShippingDiscount);
    }, [initialSelectedShippingVoucher, initialShippingDiscount]);

    const fetchAddresses = async () => {
        setAddressesLoading(true);
        try {
            const res = await fetch('/api/auth/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
                if (data.length > 0) {
                    const primary = data.find(addr => addr.is_primary) || data[0];
                    setAddress({
                        id: primary.id,
                        name: primary.name,
                        phone: primary.phone,
                        detail: primary.address + ', Kel. ' + primary.village + ', Kec. ' + primary.district + ', ' + primary.city + ', ' + primary.province,
                        postal_code: primary.postal_code,
                        latitude: primary.latitude || '',
                        longitude: primary.longitude || '',
                    });
                }
            }
        } catch (e) {
            console.error("Gagal mengambil data alamat:", e);
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        loadMidtransSnap(settings);
    }, [settings]);

    useEffect(() => {
        if (currentUser) {
            fetchAddresses();
        }
    }, [currentUser]);

    const subtotal = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
    const shippingFee = selectedCourier ? selectedCourier.price : 0;
    const total = Math.max(0, subtotal + shippingFee - voucherDiscount - shippingDiscount);

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const csrfToken = getCsrfToken();
            const items = cart.map(item => ({
                product_id: item.product.id,
                variant_name: item.variant,
                quantity: item.quantity
            }));

            let combinedVoucherCode = null;
            if (selectedVoucher && selectedShippingVoucher) {
                combinedVoucherCode = `${selectedVoucher.code}+${selectedShippingVoucher.code}`;
            } else if (selectedVoucher) {
                combinedVoucherCode = selectedVoucher.code;
            } else if (selectedShippingVoucher) {
                combinedVoucherCode = selectedShippingVoucher.code;
            }

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
                    voucher_code: combinedVoucherCode
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
                        onOrderSuccess({
                            address, items: cart, courier: selectedCourier,
                            subtotal, shipping: shippingFee, total,
                            paymentMethod: 'Midtrans VA/QRIS',
                            order_number: data.order.order_number,
                            discount: voucherDiscount + shippingDiscount,
                            voucher_code: combinedVoucherCode
                        });
                    },
                    onPending: function (result) {
                        onOrderSuccess({
                            address, items: cart, courier: selectedCourier,
                            subtotal, shipping: shippingFee, total,
                            paymentMethod: 'Midtrans VA/QRIS',
                            order_number: data.order.order_number,
                            discount: voucherDiscount + shippingDiscount,
                            voucher_code: combinedVoucherCode
                        });
                    },
                    onError: function (result) {
                        alert('Pembayaran gagal, silakan coba lagi.');
                    },
                    onClose: function () {
                        alert('Silakan selesaikan pembayaran Anda di halaman profil.');
                        onOrderSuccess({
                            address, items: cart, courier: selectedCourier,
                            subtotal, shipping: shippingFee, total,
                            paymentMethod: 'Midtrans VA/QRIS',
                            order_number: data.order.order_number,
                            discount: voucherDiscount + shippingDiscount,
                            voucher_code: combinedVoucherCode
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
                    discount: voucherDiscount + shippingDiscount,
                    voucher_code: combinedVoucherCode
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

    const addressFilled = address.name && address.phone && address.detail && address.postal_code;

    return {
        address,
        setAddress,
        addresses,
        setAddresses,
        addressesLoading,
        fetchAddresses,
        selectedCourier,
        setSelectedCourier,
        loading,
        selectedVoucher,
        setSelectedVoucher,
        voucherDiscount,
        setVoucherDiscount,
        selectedShippingVoucher,
        setSelectedShippingVoucher,
        shippingDiscount,
        setShippingDiscount,
        subtotal,
        shippingFee,
        total,
        handlePlaceOrder,
        addressFilled
    };
}
