import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, ShieldCheck, Wallet, ChevronRight, Check, X, Copy, QrCode, CreditCard, Tag, Store } from 'lucide-react';
import { formatRupiah, getCsrfToken, loadMidtransSnap } from '../utils/helpers';

export default function CheckoutPage({ 
    cart, 
    onBack, 
    onOrderSuccess, 
    currentUser, 
    settings,
    initialSelectedVoucher = null,
    initialVoucherDiscount = 0,
    initialSelectedShippingVoucher = null,
    initialShippingDiscount = 0,
    onVoucherChange,
    onShippingVoucherChange
}) {
    const [couriers, setCouriers] = useState([]);
    const [selectedCourier, setSelectedCourier]   = useState(null);
    const [loadingRates, setLoadingRates]         = useState(false);
    const [ratesError, setRatesError]             = useState('');
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState(() => ({
        name:   currentUser?.name || '',
        phone:  currentUser?.phone || '',
        detail: currentUser?.address || '',
        postal_code: currentUser?.postal_code || '',
        latitude: currentUser?.latitude || '',
        longitude: currentUser?.longitude || '',
    }));
    const [tempAddress, setTempAddress] = useState({ ...address });

    const [loading,       setLoading]       = useState(false);

    // Customer Multiple Addresses State
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false);
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [addrModalMode, setAddrModalMode] = useState('create'); // 'create' | 'edit'
    const [editingAddrId, setEditingAddrId] = useState(null);

    // Form fields for address modal
    const [addrName, setAddrName] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrProvince, setAddrProvince] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrDistrict, setAddrDistrict] = useState('');
    const [addrVillage, setAddrVillage] = useState('');
    const [addrDetail, setAddrDetail] = useState('');
    const [addrPostalCode, setAddrPostalCode] = useState('');
    const [addrLatitude, setAddrLatitude] = useState('');
    const [addrLongitude, setAddrLongitude] = useState('');
    const [addrIsPrimary, setAddrIsPrimary] = useState(false);

    // Regions selection data
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState({ provinces: false, cities: false, districts: false, villages: false });
    const [addrError, setAddrError] = useState('');
    const [savingAddr, setSavingAddr] = useState(false);

    const [vouchers,          setVouchers]          = useState([]);
    const [selectedVoucher,   setSelectedVoucher]   = useState(initialSelectedVoucher);
    const [voucherDiscount,   setVoucherDiscount]   = useState(initialVoucherDiscount);
    const [selectedShippingVoucher, setSelectedShippingVoucher] = useState(initialSelectedShippingVoucher);
    const [shippingDiscount,  setShippingDiscount]  = useState(initialShippingDiscount);
    const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
    const [voucherInputCode,  setVoucherInputCode]  = useState('');
    const [voucherError,      setVoucherError]      = useState('');

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

    const fetchProvinces = async () => {
        setLoadingRegions(prev => ({ ...prev, provinces: true }));
        try {
            const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            if (res.ok) {
                const data = await res.json();
                setProvinces(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data provinsi:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, provinces: false }));
        }
    };

    const fetchCities = async (provinceId) => {
        setLoadingRegions(prev => ({ ...prev, cities: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
            if (res.ok) {
                const data = await res.json();
                setCities(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data kota:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, cities: false }));
        }
    };

    const fetchDistricts = async (cityId) => {
        setLoadingRegions(prev => ({ ...prev, districts: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
            if (res.ok) {
                const data = await res.json();
                setDistricts(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data kecamatan:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, districts: false }));
        }
    };

    const fetchVillages = async (districtId) => {
        setLoadingRegions(prev => ({ ...prev, villages: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
            if (res.ok) {
                const data = await res.json();
                setVillages(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data desa:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, villages: false }));
        }
    };

    // Auto-fetch child region lists when parent state changes in edit mode
    useEffect(() => {
        if (!isAddrModalOpen || provinces.length === 0) return;
        if (addrProvince) {
            const foundProv = provinces.find(p => p.name.toUpperCase() === addrProvince.toUpperCase());
            if (foundProv) {
                fetchCities(foundProv.id);
            }
        }
    }, [addrProvince, provinces, isAddrModalOpen]);

    useEffect(() => {
        if (!isAddrModalOpen || cities.length === 0) return;
        if (addrCity) {
            const foundCity = cities.find(c => c.name.toUpperCase() === addrCity.toUpperCase());
            if (foundCity) {
                fetchDistricts(foundCity.id);
            }
        }
    }, [addrCity, cities, isAddrModalOpen]);

    useEffect(() => {
        if (!isAddrModalOpen || districts.length === 0) return;
        if (addrDistrict) {
            const foundDist = districts.find(d => d.name.toUpperCase() === addrDistrict.toUpperCase());
            if (foundDist) {
                fetchVillages(foundDist.id);
            }
        }
    }, [addrDistrict, districts, isAddrModalOpen]);

    const handleOpenCreateAddrModal = () => {
        setAddrModalMode('create');
        setEditingAddrId(null);
        setAddrName(currentUser?.name || '');
        setAddrPhone(currentUser?.phone || '');
        setAddrProvince('');
        setAddrCity('');
        setAddrDistrict('');
        setAddrVillage('');
        setAddrDetail('');
        setAddrPostalCode('');
        setAddrLatitude('');
        setAddrLongitude('');
        setAddrIsPrimary(addresses.length === 0);
        setAddrError('');
        setIsAddrModalOpen(true);
        fetchProvinces();
    };

    const handleOpenEditAddrModal = async (addr) => {
        setAddrModalMode('edit');
        setEditingAddrId(addr.id);
        setAddrName(addr.name || '');
        setAddrPhone(addr.phone || '');
        setAddrDetail(addr.address || '');
        setAddrPostalCode(addr.postal_code || '');
        setAddrLatitude(addr.latitude || '');
        setAddrLongitude(addr.longitude || '');
        setAddrIsPrimary(addr.is_primary || false);

        setAddrProvince(addr.province || '');
        setAddrCity(addr.city || '');
        setAddrDistrict(addr.district || '');
        setAddrVillage(addr.village || '');
        setAddrError('');

        setIsAddrModalOpen(true);
        await fetchProvinces();
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setSavingAddr(true);
        setAddrError('');

        const payload = {
            name: addrName,
            phone: addrPhone,
            province: addrProvince,
            city: addrCity,
            district: addrDistrict,
            village: addrVillage,
            address: addrDetail,
            postal_code: addrPostalCode,
            latitude: addrLatitude ? parseFloat(addrLatitude) : null,
            longitude: addrLongitude ? parseFloat(addrLongitude) : null,
            is_primary: addrIsPrimary,
        };

        try {
            const url = addrModalMode === 'create' ? '/api/auth/addresses' : `/api/auth/addresses/${editingAddrId}`;
            const method = addrModalMode === 'create' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setIsAddrModalOpen(false);
                setIsAddressSelectModalOpen(false);
                await fetchAddresses();
                setAddress({
                    id: data.address.id,
                    name: data.address.name,
                    phone: data.address.phone,
                    detail: data.address.address + ', Kel. ' + data.address.village + ', Kec. ' + data.address.district + ', ' + data.address.city + ', ' + data.address.province,
                    postal_code: data.address.postal_code,
                    latitude: data.address.latitude || '',
                    longitude: data.address.longitude || '',
                });
            } else {
                setAddrError(data.message || 'Gagal menyimpan alamat.');
            }
        } catch (err) {
            setAddrError('Terjadi kesalahan jaringan.');
        } finally {
            setSavingAddr(false);
        }
    };

    useEffect(() => {
        loadMidtransSnap(settings);
    }, [settings]);

    useEffect(() => {
        fetch('/api/vouchers')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setVouchers(data);
            })
            .catch(err => console.error('Gagal mengambil data voucher:', err));

        if (currentUser) {
            fetchAddresses();
        }
    }, [currentUser]);

    const subtotal      = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
    const shippingFee   = selectedCourier ? selectedCourier.price : 0;
    const total         = Math.max(0, subtotal + shippingFee - voucherDiscount - shippingDiscount);

    useEffect(() => {
        const calculatedShippingDisc = selectedShippingVoucher ? Math.min(selectedShippingVoucher.value, shippingFee) : 0;
        if (calculatedShippingDisc !== shippingDiscount) {
            setShippingDiscount(calculatedShippingDisc);
            if (onShippingVoucherChange) {
                onShippingVoucherChange(selectedShippingVoucher, calculatedShippingDisc);
            }
        }
    }, [shippingFee, selectedShippingVoucher, shippingDiscount, onShippingVoucherChange]);

    const handleSaveAddress = (e) => {
        e.preventDefault();
        setAddress({ ...tempAddress });
        setIsEditingAddress(false);
    };

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

    const fetchRates = async (addr) => {
        if (!addr.postal_code) return;
        setLoadingRates(true);
        setRatesError('');
        try {
            const csrfToken = getCsrfToken();
            const items = cart.map(item => ({
                product_id: item.product.id,
                variant_name: item.variant,
                quantity: item.quantity
            }));
            const response = await fetch('/api/shipment/rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    postal_code: addr.postal_code,
                    latitude: addr.latitude || null,
                    longitude: addr.longitude || null,
                    items
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengambil ongkir');
            }

            const rawRates = data.rates || [];
            const formattedCouriers = rawRates.map(rate => ({
                id: rate.courier_code,
                name: rate.courier_name,
                service: rate.courier_service_name,
                price: rate.price,
                eta: `${rate.duration} ${rate.duration.toLowerCase().includes('hari') ? '' : 'hari'}`,
                courier_service_code: rate.courier_service_code
            }));

            setCouriers(formattedCouriers);
            if (formattedCouriers.length > 0) {
                setSelectedCourier(formattedCouriers[0]);
            } else {
                setSelectedCourier(null);
                setRatesError('Tidak ada layanan pengiriman yang tersedia untuk area ini.');
            }
        } catch (err) {
            console.error(err);
            setRatesError(err.message || 'Gagal menghitung ongkos kirim. Silakan periksa kembali kode pos Anda.');
            setCouriers([]);
            setSelectedCourier(null);
        } finally {
            setLoadingRates(false);
        }
    };

    useEffect(() => {
        if (address.postal_code) {
            fetchRates(address);
        } else {
            setCouriers([]);
            setSelectedCourier(null);
        }
    }, [address, cart]);

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
                        console.log('Payment success:', result);
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
                        console.log('Payment pending:', result);
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

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .scp * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
                @keyframes scp-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scp-modal { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes scp-spin { to { transform: rotate(360deg); } }
                .scp-spin { animation: scp-spin 0.8s linear infinite; }
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
                .scp-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                @media (min-width: 1024px) {
                    .scp-layout {
                        grid-template-columns: 2.2fr 1fr;
                        gap: 16px;
                    }
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

                <div className="scp-layout">
                    {/* LEFT: Details */}
                    <div>

                        {/* 1. Address */}
                        <div className="scp-card">
                            <div className="scp-card-header">
                                <MapPin size={16} color="#c0001a" />
                                <span className="scp-card-title">Alamat Pengiriman</span>
                            </div>
                            <div className="scp-card-body">
                                {addressesLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                                        <div className="scp-spin" style={{ width: 18, height: 18, border: '2.5px solid #f3f3f3', borderTop: '2.5px solid #c0001a', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: 12, color: '#666' }}>Memuat daftar alamat...</span>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                        <p style={{ fontSize: '12.5px', color: '#666', marginBottom: '12px' }}>Belum ada alamat pengiriman disimpan.</p>
                                        <button 
                                            type="button"
                                            onClick={handleOpenCreateAddrModal}
                                            style={{
                                                background: '#c0001a',
                                                color: '#fff',
                                                fontWeight: '750',
                                                fontSize: '12px',
                                                padding: '8px 16px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + Tambah Alamat Baru
                                        </button>
                                    </div>
                                ) : (
                                    <div className="scp-addr-filled">
                                        <div className="scp-addr-dot" />
                                        <div style={{ flex: 1 }}>
                                            <div>
                                                <span className="scp-addr-name">{address.name || '—'}</span>
                                                {address.phone && <span className="scp-addr-phone">({address.phone})</span>}
                                            </div>
                                            <div className="scp-addr-detail">
                                                {address.detail || <span style={{ color: '#c0001a', fontSize: 12 }}>Alamat belum diisi</span>}
                                                {address.postal_code && (
                                                    <div style={{ color: '#666', fontSize: 11.5, marginTop: 4, fontWeight: 500 }}>
                                                        Kode Pos: <span style={{ fontWeight: 700, color: '#222' }}>{address.postal_code}</span>
                                                        {address.latitude && address.longitude && ` (${address.latitude}, ${address.longitude})`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="scp-addr-change" onClick={() => setIsAddressSelectModalOpen(true)}>
                                            Pilih Alamat Lain
                                        </button>
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
                                            {formatRupiah(item.product.price * item.quantity)}
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
                                {loadingRates ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="scp-spin" style={{ width: 24, height: 24, border: '3px solid #f3f3f3', borderTop: '3px solid #c0001a', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Memeriksa ongkos kirim...</span>
                                    </div>
                                ) : ratesError ? (
                                    <div style={{ padding: '12px', border: '1px solid #ffcccc', background: '#fff0f0', color: '#c0001a', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                                        ⚠️ {ratesError}
                                    </div>
                                ) : !address.postal_code ? (
                                    <div style={{ padding: '16px', border: '1px dashed #ddd', color: '#666', borderRadius: 4, fontSize: 12, textAlign: 'center' }}>
                                        Silakan lengkapi alamat dan <strong>Kode Pos</strong> pengiriman terlebih dahulu untuk menghitung ongkos kirim.
                                    </div>
                                ) : couriers.length === 0 ? (
                                    <div style={{ padding: '16px', border: '1px dashed #ddd', color: '#666', borderRadius: 4, fontSize: 12, textAlign: 'center' }}>
                                        Tidak ada layanan pengiriman yang tersedia untuk alamat ini.
                                    </div>
                                ) : (
                                    couriers.map(cour => (
                                        <button
                                            key={`${cour.id}-${cour.service}`}
                                            className={`scp-courier-option ${selectedCourier && selectedCourier.id === cour.id && selectedCourier.service === cour.service ? 'active' : ''}`}
                                            onClick={() => setSelectedCourier(cour)}
                                            style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            <div className="scp-courier-radio">
                                                {selectedCourier && selectedCourier.id === cour.id && selectedCourier.service === cour.service && <div className="scp-courier-dot" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="scp-courier-name">{cour.name}</div>
                                                <div className="scp-courier-service">{cour.service}</div>
                                                <span className="scp-courier-eta">Estimasi {cour.eta}</span>
                                            </div>
                                            <div className="scp-courier-price">{formatRupiah(cour.price)}</div>
                                        </button>
                                    ))
                                )}
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
                    <div>
                        <div className="scp-summary-card" style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 12 }}>Ringkasan Belanja</div>
                            <div className="scp-sum-row">
                                <span>Subtotal Produk</span>
                                <span style={{ color: '#222', fontWeight: 600 }}>{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="scp-sum-row">
                                <span>Biaya Pengiriman</span>
                                <span style={{ color: '#222', fontWeight: 600 }}>{formatRupiah(shippingFee)}</span>
                            </div>
                             <div className="scp-sum-row" style={{ marginBottom: 0 }}>
                                 <span>Diskon Voucher</span>
                                 <span style={{ color: '#c0001a', fontWeight: 600 }}>- {formatRupiah(voucherDiscount)}</span>
                             </div>
                             {selectedShippingVoucher ? (
                                 <div className="scp-sum-row" style={{ marginBottom: 0, marginTop: 6 }}>
                                     <span>Diskon Ongkir ({selectedShippingVoucher.code})</span>
                                     <span style={{ color: '#22c55e', fontWeight: 600 }}>- {formatRupiah(shippingDiscount)}</span>
                                 </div>
                             ) : null}
                            <div className="scp-sum-total">
                                <span className="scp-sum-total-label">Total Pembayaran</span>
                                <span className="scp-sum-total-val">{formatRupiah(total)}</span>
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
                                borderLeft: (selectedVoucher || selectedShippingVoucher) ? '3px solid #c0001a' : ''
                            }}
                            onClick={() => setShowVoucherDrawer(true)}
                        >
                            <Tag size={15} color="#c0001a" />
                            <div style={{ flex: 1 }}>
                                {(selectedVoucher || selectedShippingVoucher) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {selectedVoucher && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#c0001a' }}>
                                                        Voucher Belanja: {selectedVoucher.code}
                                                    </span>
                                                    <div style={{ fontSize: 11, color: '#2e7d4a', fontWeight: 600 }}>
                                                        Hemat {formatRupiah(voucherDiscount)}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveVoucher('discount'); }}
                                                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '2px 6px' }}
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        )}
                                        {selectedShippingVoucher && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: selectedVoucher ? '1px dashed #eee' : 'none', paddingTop: selectedVoucher ? '4px' : '0' }}>
                                                <div>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
                                                        Voucher Ongkir: {selectedShippingVoucher.code}
                                                    </span>
                                                    <div style={{ fontSize: 11, color: '#2e7d4a', fontWeight: 600 }}>
                                                        Potongan {formatRupiah(shippingDiscount)}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveVoucher('free_shipping'); }}
                                                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '2px 6px' }}
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span style={{ fontSize: 12.5, color: '#555', fontWeight: 600 }}>
                                        Gunakan Voucher / Promo
                                    </span>
                                )}
                            </div>
                            {!(selectedVoucher || selectedShippingVoucher) && (
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
                        <div className="scp-sticky-val">{formatRupiah(total)}</div>
                    </div>
                    <button
                        className="scp-order-btn"
                        onClick={handlePlaceOrder}
                        disabled={!addressFilled || !selectedCourier || loading || loadingRates}
                        title={!addressFilled ? 'Lengkapi alamat pengiriman terlebih dahulu' : (!selectedCourier ? 'Pilih metode pengiriman terlebih dahulu' : '')}
                    >
                        {loading ? 'Membuat Pesanan...' : (!addressFilled ? 'Isi Alamat Dulu' : (!selectedCourier ? 'Pilih Pengiriman' : 'Buat Pesanan'))}
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
                                    const isSelected = vch.type === 'free_shipping'
                                        ? !!(selectedShippingVoucher && selectedShippingVoucher.id === vch.id)
                                        : !!(selectedVoucher && selectedVoucher.id === vch.id);
                                    return (
                                        <div key={vch.id} className={`vch-card ${isSelected ? 'selected' : ''}`} style={{ opacity: isDisabled ? 0.6 : 1, borderColor: isSelected ? (vch.type === 'free_shipping' ? '#22c55e' : '#c0001a') : '#f0f0f0', background: isSelected ? (vch.type === 'free_shipping' ? '#f0fdf4' : '#fffcfc') : '#fff' }}>
                                            <div className="vch-info">
                                                <span className="vch-code-badge" style={vch.type === 'free_shipping' ? { background: '#f0fdf4', color: '#22c55e', borderColor: '#bbf7d0' } : {}}>{vch.code}</span>
                                                <div className="vch-name">
                                                    {vch.type === 'free_shipping'
                                                        ? `Gratis Ongkir s.d. ${formatRupiah(vch.value)}`
                                                        : vch.type === 'percent' 
                                                            ? `Diskon ${vch.value}%` 
                                                            : `Potongan ${formatRupiah(vch.value)}`}
                                                </div>
                                                <div className="vch-desc">
                                                    {vch.type === 'free_shipping'
                                                        ? 'Potongan langsung untuk ongkos kirim Biteship'
                                                        : vch.type === 'percent' && vch.max_discount
                                                            ? `Maksimal potongan ${formatRupiah(vch.max_discount)}`
                                                            : 'Diskon langsung tanpa batas maksimal'}
                                                </div>
                                                <div className="vch-min">
                                                    Min. Belanja {formatRupiah(vch.min_spend)}
                                                </div>
                                            </div>
                                            <button 
                                                className={`vch-select-btn ${isSelected ? 'active' : ''}`}
                                                style={isSelected && vch.type === 'free_shipping' ? { background: '#22c55e', borderColor: '#22c55e' } : (vch.type === 'free_shipping' ? { color: '#22c55e', borderColor: '#22c55e' } : {})}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        handleRemoveVoucher(vch.type);
                                                    } else {
                                                        if (vch.type === 'free_shipping') {
                                                            const calculatedShippingDisc = Math.min(vch.value, shippingFee);
                                                            setSelectedShippingVoucher(vch);
                                                            setShippingDiscount(calculatedShippingDisc);
                                                            if (onShippingVoucherChange) onShippingVoucherChange(vch, calculatedShippingDisc);
                                                        } else {
                                                            setSelectedVoucher(vch);
                                                            let disc = 0;
                                                            if (vch.type === 'percent') {
                                                                disc = subtotal * (vch.value / 100);
                                                                if (vch.max_discount && disc > vch.max_discount) disc = vch.max_discount;
                                                            } else {
                                                                disc = Math.min(vch.value, subtotal);
                                                            }
                                                            setVoucherDiscount(disc);
                                                            if (onVoucherChange) onVoucherChange(vch, disc);
                                                        }
                                                    }
                                                }}
                                            >
                                                {isSelected ? 'Terpakai' : 'Gunakan'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Address Selector Modal ── */}
            {isAddressSelectModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '680px',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            background: '#c0001a',
                            padding: '16px 20px',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '15px', fontWeight: 800 }}>Pilih Alamat Pengiriman</span>
                            <button 
                                onClick={() => setIsAddressSelectModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto' }}>
                            <button 
                                type="button"
                                onClick={handleOpenCreateAddrModal}
                                style={{
                                    border: '1.5px dashed #c0001a',
                                    borderRadius: '6px',
                                    color: '#c0001a',
                                    background: '#fff5f5',
                                    padding: '12px',
                                    fontSize: '13px',
                                    fontWeight: '750',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    width: '100%'
                                }}
                            >
                                + Tambah Alamat Baru
                            </button>

                            {addresses.map((addr) => {
                                const isActive = address.id === addr.id;
                                return (
                                    <div 
                                        key={addr.id}
                                        onClick={() => {
                                            setAddress({
                                                id: addr.id,
                                                name: addr.name,
                                                phone: addr.phone,
                                                detail: addr.address + ', Kel. ' + addr.village + ', Kec. ' + addr.district + ', ' + addr.city + ', ' + addr.province,
                                                postal_code: addr.postal_code,
                                                latitude: addr.latitude || '',
                                                longitude: addr.longitude || '',
                                            });
                                            setIsAddressSelectModalOpen(false);
                                        }}
                                        style={{
                                            padding: '14px 16px',
                                            border: isActive ? '2px solid #c0001a' : '1px solid #eef0f2',
                                            background: isActive ? '#fffcfc' : '#fff',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            borderLeft: isActive ? '4px solid #c0001a' : '1px solid #eef0f2'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#222' }}>{addr.name}</span>
                                                <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>({addr.phone})</span>
                                                {addr.is_primary && (
                                                    <span style={{
                                                        fontSize: '9px',
                                                        fontWeight: 750,
                                                        background: '#c0001a',
                                                        padding: '1px 5px',
                                                        borderRadius: '2px',
                                                        color: '#fff',
                                                        textTransform: 'uppercase'
                                                    }}>Utama</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#444', marginTop: '4px', lineHeight: 1.4 }}>
                                                {addr.address}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                Kel. {addr.village}, Kec. {addr.district}, {addr.city}, {addr.province}
                                            </div>
                                            <div style={{ fontSize: '10.5px', color: '#888', marginTop: '2px' }}>
                                                Kode Pos: {addr.postal_code}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleOpenEditAddrModal(addr); }}
                                                style={{ background: 'none', border: 'none', color: '#3182ce', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Ubah
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Address Add/Edit Modal ── */}
            {isAddrModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '680px',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            background: '#c0001a',
                            padding: '16px 20px',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '15px', fontWeight: 800 }}>
                                {addrModalMode === 'create' ? 'Tambah Alamat Baru' : 'Ubah Alamat'}
                            </span>
                            <button 
                                onClick={() => setIsAddrModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddressSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                            {addrError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                    {addrError}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Nama Penerima</label>
                                    <input 
                                        type="text" 
                                        className="scp-input" 
                                        value={addrName} 
                                        onChange={(e) => setAddrName(e.target.value)} 
                                        placeholder="Nama Lengkap" 
                                        disabled={savingAddr} 
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Nomor HP Penerima</label>
                                    <input 
                                        type="text" 
                                        className="scp-input" 
                                        value={addrPhone} 
                                        onChange={(e) => setAddrPhone(e.target.value)} 
                                        placeholder="Contoh: 08xxxxxxxxxx" 
                                        disabled={savingAddr} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Provinsi</label>
                                    <select
                                        className="scp-input"
                                        value={addrProvince}
                                        onChange={(e) => {
                                            setAddrProvince(e.target.value);
                                            setAddrCity('');
                                            setAddrDistrict('');
                                            setAddrVillage('');
                                            setCities([]);
                                            setDistricts([]);
                                            setVillages([]);
                                        }}
                                        disabled={savingAddr || loadingRegions.provinces}
                                        required
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {provinces.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Kota / Kabupaten</label>
                                    <select
                                        className="scp-input"
                                        value={addrCity}
                                        onChange={(e) => {
                                            setAddrCity(e.target.value);
                                            setAddrDistrict('');
                                            setAddrVillage('');
                                            setDistricts([]);
                                            setVillages([]);
                                        }}
                                        disabled={savingAddr || !addrProvince || loadingRegions.cities}
                                        required
                                    >
                                        <option value="">Pilih Kota/Kabupaten</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Kecamatan</label>
                                    <select
                                        className="scp-input"
                                        value={addrDistrict}
                                        onChange={(e) => {
                                            setAddrDistrict(e.target.value);
                                            setAddrVillage('');
                                            setVillages([]);
                                        }}
                                        disabled={savingAddr || !addrCity || loadingRegions.districts}
                                        required
                                    >
                                        <option value="">Pilih Kecamatan</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Desa / Kelurahan</label>
                                    <select
                                        className="scp-input"
                                        value={addrVillage}
                                        onChange={(e) => setAddrVillage(e.target.value)}
                                        disabled={savingAddr || !addrDistrict || loadingRegions.villages}
                                        required
                                    >
                                        <option value="">Pilih Desa/Kelurahan</option>
                                        {villages.map(v => (
                                            <option key={v.id} value={v.name}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Detail Alamat (Jalan, Blok, No. Rumah, RT/RW)</label>
                                <textarea 
                                    className="scp-input" 
                                    style={{ minHeight: '60px', resize: 'vertical' }}
                                    value={addrDetail} 
                                    onChange={(e) => setAddrDetail(e.target.value)} 
                                    placeholder="Nama jalan, gedung, blok, nomor rumah, RT/RW, dsb."
                                    disabled={savingAddr}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Kode Pos</label>
                                    <input 
                                        type="text" 
                                        className="scp-input" 
                                        value={addrPostalCode} 
                                        onChange={(e) => setAddrPostalCode(e.target.value)} 
                                        placeholder="12345"
                                        disabled={savingAddr}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Latitude (Opsional)</label>
                                    <input 
                                        type="text" 
                                        className="scp-input" 
                                        value={addrLatitude} 
                                        onChange={(e) => setAddrLatitude(e.target.value)} 
                                        placeholder="-6.1234"
                                        disabled={savingAddr}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Longitude (Opsional)</label>
                                    <input 
                                        type="text" 
                                        className="scp-input" 
                                        value={addrLongitude} 
                                        onChange={(e) => setAddrLongitude(e.target.value)} 
                                        placeholder="106.1234"
                                        disabled={savingAddr}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                                <input 
                                    type="checkbox" 
                                    id="addrIsPrimaryCheckout" 
                                    checked={addrIsPrimary} 
                                    onChange={(e) => setAddrIsPrimary(e.target.checked)}
                                    disabled={savingAddr || (addrModalMode === 'edit' && addrIsPrimary)}
                                />
                                <label htmlFor="addrIsPrimaryCheckout" style={{ fontSize: '12px', fontWeight: 600, color: '#4a5568', cursor: 'pointer' }}>
                                    Jadikan alamat utama / default pengiriman
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #edf2f7', paddingTop: '14px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddrModalOpen(false)}
                                    style={{
                                        background: '#edf2f7',
                                        color: '#4a5568',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    disabled={savingAddr}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    style={{
                                        background: '#c0001a',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    disabled={savingAddr}
                                >
                                    {savingAddr ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
