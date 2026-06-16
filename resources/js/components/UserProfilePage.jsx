import React, { useState, useEffect } from 'react';
import { User, MapPin, ClipboardList, CreditCard, Truck, AlertCircle, CheckCircle, ArrowLeft, Phone, Mail, ChevronRight, ShoppingBag, Copy, Check, Calendar, Star, Award, ShieldCheck, Map, Pencil, Trash2, Home, Briefcase, Plus, Loader, Info, ExternalLink } from 'lucide-react';

/**
 * Resolve image URL for an order item's product.
 * Handles absolute URLs (Unsplash), relative storage paths, and fallback.
 */
function getProductImageUrl(item) {
    const img = item.product_variant?.product?.main_image || item.productVariant?.product?.main_image;
    if (!img) return '/images/default-product.png';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/')) return img;
    return `/storage/${img}`;
}

export default function UserProfilePage({ currentUser, onUpdateUser, onBack, settings, initialTab = 'profile', onTabChange }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'address' | 'orders'
    const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'
    const [copiedText, setCopiedText] = useState(null);
    const handleCopyText = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedText(type);
        setTimeout(() => setCopiedText(null), 2000);
    };

    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        if (onTabChange) {
            onTabChange(activeTab);
        }
    }, [activeTab]);
    
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
    // Profile Form State
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [address, setAddress] = useState(currentUser?.address || '');
    const [postalCode, setPostalCode] = useState(currentUser?.postal_code || '');
    const [latitude, setLatitude] = useState(currentUser?.latitude || '');
    const [longitude, setLongitude] = useState(currentUser?.longitude || '');
    const [gender, setGender] = useState('laki-laki');
    const [birthDay, setBirthDay] = useState('15');
    const [birthMonth, setBirthMonth] = useState('6');
    const [birthYear, setBirthYear] = useState('1995');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    // Order Detail & Shipment Tracking States
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Product Review States
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [reviewProduct, setReviewProduct] = useState(null); 
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewPhoto, setReviewPhoto] = useState(null);
    const [reviewPhotoPreview, setReviewPhotoPreview] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);




    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setPhone(currentUser.phone || '');
            setAddress(currentUser.address || '');
            setPostalCode(currentUser.postal_code || '');
            setLatitude(currentUser.latitude || '');
            setLongitude(currentUser.longitude || '');
        }
    }, [currentUser]);

    // Customer Multiple Addresses State
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [addrModalMode, setAddrModalMode] = useState('create'); // 'create' | 'edit'
    const [editingAddrId, setEditingAddrId] = useState(null);

    // Form fields for address
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

    const fetchAddresses = async () => {
        setAddressesLoading(true);
        try {
            const res = await fetch('/api/auth/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data alamat:", e);
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'address') {
            fetchAddresses();
        }
    }, [activeTab]);

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

        setIsAddrModalOpen(true);
        await fetchProvinces();
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setProfileSuccess(addrModalMode === 'create' ? 'Alamat berhasil ditambahkan!' : 'Alamat berhasil diperbarui!');
                setIsAddrModalOpen(false);
                fetchAddresses();
                if (payload.is_primary && onUpdateUser) {
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        onUpdateUser(meData);
                    }
                }
            } else {
                setProfileError(data.message || 'Gagal menyimpan alamat.');
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleSetPrimaryAddress = async (id) => {
        setProfileError('');
        setProfileSuccess('');
        try {
            const res = await fetch(`/api/auth/addresses/${id}/primary`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });
            if (res.ok) {
                fetchAddresses();
                setProfileSuccess('Alamat utama berhasil diubah!');
                if (onUpdateUser) {
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        onUpdateUser(meData);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
        setProfileError('');
        setProfileSuccess('');
        try {
            const res = await fetch(`/api/auth/addresses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });
            if (res.ok) {
                fetchAddresses();
                setProfileSuccess('Alamat berhasil dihapus!');
                if (onUpdateUser) {
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        onUpdateUser(meData);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Orders State
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [payLoading, setPayLoading] = useState({});
    const [paySimulateLoading, setPaySimulateLoading] = useState({});
    const [shipSimulateLoading, setShipSimulateLoading] = useState({});

    // Sync selectedOrder details with updated orders array (e.g. after review submission or payment status updates)
    useEffect(() => {
        if (selectedOrder && orders.length > 0) {
            const updated = orders.find(o => o.id === selectedOrder.id);
            if (updated) {
                setSelectedOrder(updated);
            }
        }
    }, [orders]);


    // Fetch Orders
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
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    // Handle Profile Update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({ name, phone, address, postal_code: postalCode, latitude, longitude })
            });
            const data = await res.json();
            if (res.ok) {
                setProfileSuccess('Profil berhasil diperbarui!');
                if (onUpdateUser) {
                    onUpdateUser(data.customer);
                }
            } else {
                if (data.status === 'validation_error') {
                    const firstErr = Object.values(data.errors)[0][0];
                    setProfileError(firstErr);
                } else {
                    setProfileError(data.message || 'Gagal memperbarui profil.');
                }
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setProfileLoading(false);
        }
    };

    // Handle Real Payment using Midtrans Snap
    const handlePay = async (orderId) => {
        setPayLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`/api/orders/${orderId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });
            const data = await res.json();
            if (res.ok && data.payment?.snap_token) {
                if (window.snap) {
                    window.snap.pay(data.payment.snap_token, {
                        onSuccess: function (result) {
                            console.log('Payment success:', result);
                            fetchOrders();
                        },
                        onPending: function (result) {
                            console.log('Payment pending:', result);
                            fetchOrders();
                        },
                        onError: function (result) {
                            console.error('Payment error:', result);
                            alert('Pembayaran gagal, silakan coba lagi.');
                        },
                        onClose: function () {
                            console.log('Payment popup closed');
                        }
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
            console.error(e);
            alert('Kesalahan jaringan saat memproses pembayaran.');
        } finally {
            setPayLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Handle Pay Simulate (Test)
    const handlePaySimulate = async (orderId) => {
        setPaySimulateLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`/api/orders/${orderId}/pay-simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Simulasi pembayaran berhasil.');
                fetchOrders();
            } else {
                alert(data.message || 'Gagal mensimulasikan pembayaran.');
            }
        } catch (e) {
            console.error(e);
            alert('Kesalahan jaringan saat memproses simulasi pembayaran.');
        } finally {
            setPaySimulateLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Handle Ship Simulate (Test)
    const handleShipSimulate = async (orderId) => {
        setShipSimulateLoading(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`/api/orders/${orderId}/ship-simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
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
            console.error(e);
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
            console.error("Gagal mengambil data pengiriman:", e);
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

    const handleReviewPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReviewPhoto(file);
            setReviewPhotoPreview(URL.createObjectURL(file));
        }
    };

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
        if (reviewPhoto) {
            formData.append('photo', reviewPhoto);
        }

        try {
            const res = await fetch(`/api/orders/${reviewOrder.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setProfileSuccess(data.message || 'Ulasan berhasil dikirim!');
                setIsReviewModalOpen(false);
                setReviewRating(5);
                setReviewComment('');
                setReviewPhoto(null);
                setReviewPhotoPreview(null);
                fetchOrders();
                if (selectedOrder && selectedOrder.id === reviewOrder.id) {
                    setSelectedOrder(prev => ({
                        ...prev,
                        reviews: [...(prev.reviews || []), data.review]
                    }));
                }
            } else {
                setProfileError(data.message || 'Gagal mengirim ulasan.');
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan.');
        } finally {
            setReviewLoading(false);
        }
    };

    // Filter orders locally based on status tab
    const getFilteredOrders = () => {
        if (orderFilter === 'all') return orders;
        return orders.filter(o => o.status === orderFilter);
    };

    const fmt = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

    const getItemProductReview = (item) => {
        if (!selectedOrder || !selectedOrder.reviews) return null;
        const productId = item.productVariant?.product_id;
        if (!productId) return null;
        return selectedOrder.reviews.find(r => r.product_id === productId);
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

    const getStepIndex = (status) => {
        switch (status) {
            case 'pending': return 0;
            case 'processing': return 1;
            case 'shipping': return 2;
            case 'completed': return 3;
            default: return -1;
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-[90vh] py-8 font-sans text-[14px] text-slate-800">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={onBack} 
                    className="group mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-[#ff5722] font-semibold text-sm transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span>Kembali ke Toko</span>
                </button>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-[220px] shrink-0 flex flex-col gap-6 bg-transparent p-0">
                        {/* Profile Header Block */}
                        <div className="flex items-center gap-4.5 pb-5 border-b border-slate-200/60">
                            <div className="relative group">
                                <div className="w-14 h-14 rounded-full ring-2 ring-orange-500/10 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                    {currentUser?.avatar ? (
                                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <div className="grow overflow-hidden">
                                <div className="font-bold text-slate-800 truncate text-sm leading-snug">{currentUser?.name}</div>
                                <button 
                                    onClick={() => setActiveTab('profile')} 
                                    className="flex items-center gap-1 text-[12px] text-slate-400 font-medium mt-1 hover:text-[#ff5722] transition-colors"
                                >
                                    <Pencil size={11} className="stroke-[2.5]" />
                                    <span>Ubah Profil</span>
                                </button>
                            </div>
                        </div>

                        {/* Navigation Menus */}
                        <div className="flex flex-col gap-4">
                            {/* Account Dropdown */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm mb-2.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                        <User size={14} className="stroke-[2.5]" />
                                    </div>
                                    <span>Akun Saya</span>
                                </div>
                                <div className="pl-9 flex flex-col gap-2.5">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className={`text-sm text-left transition-all duration-200 cursor-pointer ${activeTab === 'profile' ? 'text-[#ff5722] font-semibold scale-[1.02]' : 'text-slate-500 hover:text-[#ff5722]'}`}
                                    >
                                        Profil
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('address')}
                                        className={`text-sm text-left transition-all duration-200 cursor-pointer ${activeTab === 'address' ? 'text-[#ff5722] font-semibold scale-[1.02]' : 'text-slate-500 hover:text-[#ff5722]'}`}
                                    >
                                        Alamat
                                    </button>
                                </div>
                            </div>

                            {/* Purchase Menu */}
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-3 text-sm text-left font-semibold transition-all duration-200 w-full cursor-pointer py-1.5 px-3 rounded-lg ${activeTab === 'orders' ? 'text-[#ff5722] bg-orange-50/50' : 'text-slate-700 hover:text-[#ff5722] hover:bg-slate-50'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${activeTab === 'orders' ? 'bg-orange-50 text-[#ff5722]' : 'bg-orange-50/40 text-orange-500'}`}>
                                    <ClipboardList size={14} className="stroke-[2.5]" />
                                </div>
                                <span>Pesanan Saya</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[550px] flex flex-col overflow-hidden">
                        {activeTab === 'profile' && (
                            <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col">
                                <div className="border-b border-slate-100 pb-5 mb-8">
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Profil Saya</h3>
                                    <p className="text-sm text-slate-400 mt-1">Kelola informasi profil Anda untuk mengontrol, mengamankan dan melindungi akun</p>
                                </div>

                                <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-12 grow items-start">
                                    {/* Profile Form (Left Column) */}
                                    <form onSubmit={handleProfileSubmit} className="w-full lg:w-[68%] flex flex-col gap-6">
                                        {profileSuccess && (
                                            <div className="bg-emerald-50/60 border border-emerald-100 text-emerald-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-all">
                                                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                <span>{profileSuccess}</span>
                                            </div>
                                        )}
                                        {profileError && (
                                            <div className="bg-red-50/60 border border-red-100 text-red-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-all">
                                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                                <span>{profileError}</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                            <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Username (Email)</label>
                                            <div className="w-full sm:w-[75%] text-slate-700 text-sm font-bold py-1">
                                                {currentUser?.email || ''}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                            <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Nama Lengkap</label>
                                            <div className="w-full sm:w-[75%]">
                                                <input 
                                                    type="text" 
                                                    className="w-full max-w-md h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white" 
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)} 
                                                    disabled={profileLoading} 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                            <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Nomor Telepon</label>
                                            <div className="w-full sm:w-[75%]">
                                                <input 
                                                    type="text" 
                                                    className="w-full max-w-md h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white" 
                                                    value={phone} 
                                                    onChange={(e) => setPhone(e.target.value)} 
                                                    disabled={profileLoading} 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        {/* Jenis Kelamin (Cosmetic/High Fidelity) */}
                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                            <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Jenis Kelamin</label>
                                            <div className="w-full sm:w-[75%] flex items-center gap-6 text-sm text-slate-700 font-medium">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="radio" 
                                                        name="gender" 
                                                        value="laki-laki" 
                                                        checked={gender === 'laki-laki'} 
                                                        onChange={(e) => setGender(e.target.value)} 
                                                        className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722]/20 border-slate-300 accent-[#ff5722]"
                                                    />
                                                    <span>Laki-laki</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="radio" 
                                                        name="gender" 
                                                        value="perempuan" 
                                                        checked={gender === 'perempuan'} 
                                                        onChange={(e) => setGender(e.target.value)} 
                                                        className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722]/20 border-slate-300 accent-[#ff5722]"
                                                    />
                                                    <span>Perempuan</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="radio" 
                                                        name="gender" 
                                                        value="lainnya" 
                                                        checked={gender === 'lainnya'} 
                                                        onChange={(e) => setGender(e.target.value)} 
                                                        className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722]/20 border-slate-300 accent-[#ff5722]"
                                                    />
                                                    <span>Lainnya</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Tanggal Lahir (Cosmetic/High Fidelity) */}
                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                            <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Tanggal Lahir</label>
                                            <div className="w-full sm:w-[75%] flex items-center gap-3">
                                                <select 
                                                    value={birthDay} 
                                                    onChange={(e) => setBirthDay(e.target.value)} 
                                                    className="h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-700 bg-white cursor-pointer outline-none transition"
                                                >
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                                <select 
                                                    value={birthMonth} 
                                                    onChange={(e) => setBirthMonth(e.target.value)} 
                                                    className="h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-700 bg-white cursor-pointer outline-none transition"
                                                >
                                                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                                                        <option key={m} value={idx + 1}>{m}</option>
                                                    ))}
                                                </select>
                                                <select 
                                                    value={birthYear} 
                                                    onChange={(e) => setBirthYear(e.target.value)} 
                                                    className="h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-700 bg-white cursor-pointer outline-none transition"
                                                >
                                                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center mt-4">
                                            <div className="w-full sm:w-[25%] pr-6" />
                                            <div className="w-full sm:w-[75%]">
                                                <button 
                                                    type="submit" 
                                                    className="px-8 py-3 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-md hover:shadow-orange-500/10 active:scale-[0.98] transition-all rounded-xl text-white font-bold text-sm cursor-pointer"
                                                    disabled={profileLoading}
                                                >
                                                    {profileLoading ? 'Menyimpan...' : 'Simpan'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    {/* Avatar preview (Right Column) */}
                                    <div className="w-full lg:w-[32%] lg:border-l lg:border-slate-100 py-6 flex flex-col items-center gap-5 text-center lg:pl-10">
                                        <div className="relative group">
                                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-102">
                                                {currentUser?.avatar ? (
                                                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={40} className="text-slate-300" />
                                                )}
                                            </div>
                                        </div>
                                        <button className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl transition cursor-pointer shadow-2xs hover:shadow-xs">
                                            Pilih Gambar
                                        </button>
                                        <div className="text-xs text-slate-400 space-y-1.5 mt-1 leading-relaxed max-w-[200px]">
                                            <div>Ukuran file: maks. 1 MB</div>
                                            <div>Format gambar: .JPEG, .PNG</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                <div className="border-b border-slate-100 pb-5 mb-8 flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Alamat Saya</h3>
                                        <p className="text-sm text-slate-400 mt-1">Kelola alamat lengkap pengiriman pesanan Anda</p>
                                    </div>
                                    <button 
                                        onClick={handleOpenCreateAddrModal}
                                        className="px-5 py-3 bg-linear-to-r from-[#ff5722] to-[#ff7a00] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                                    >
                                        <Plus size={16} className="stroke-[3px]" />
                                        <span>Tambah Alamat Baru</span>
                                    </button>
                                </div>

                                {profileSuccess && (
                                    <div className="bg-emerald-50/60 border border-emerald-100 text-emerald-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium mb-6">
                                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                        <span>{profileSuccess}</span>
                                    </div>
                                )}
                                {profileError && (
                                    <div className="bg-red-50/60 border border-red-100 text-red-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium mb-6">
                                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                                        <span>{profileError}</span>
                                    </div>
                                )}

                                {addressesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-[#ff5722] gap-3">
                                        <Loader size={32} className="animate-spin" />
                                        <p className="text-sm font-semibold text-slate-400">Memuat daftar alamat...</p>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400">
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ff5722] mx-auto mb-5">
                                            <MapPin size={28} className="opacity-85" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">Belum ada alamat pengiriman disimpan.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="border border-slate-100 hover:border-slate-200 rounded-xl p-6 hover:shadow-2xs transition-all duration-300 bg-white flex justify-between items-start gap-6 flex-col sm:flex-row">
                                                <div className="grow space-y-2">
                                                    {/* Recipient details */}
                                                    <div className="flex items-center gap-3 flex-wrap text-slate-850 font-semibold text-sm">
                                                        <span className="font-bold text-base text-slate-900">{addr.name}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <span className="text-slate-500 font-medium">{addr.phone}</span>
                                                    </div>
                                                    
                                                    {/* Detail Address */}
                                                    <p className="text-slate-600 text-sm leading-relaxed max-w-xl wrap-break-word">
                                                        {addr.address}
                                                    </p>
                                                    
                                                    {/* Region Area */}
                                                    <div className="text-slate-500 text-sm font-medium">
                                                        Kel. {addr.village}, Kec. {addr.district}, {addr.city}, {addr.province}
                                                    </div>
                                                    
                                                    {/* Postal Code & Badge */}
                                                    <div className="flex items-center gap-3 flex-wrap pt-2">
                                                        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-lg">Kode Pos: {addr.postal_code}</span>
                                                        {addr.is_primary && (
                                                            <span className="border border-[#ff5722] text-[#ff5722] bg-orange-50/30 text-[11px] font-bold px-2.5 py-0.5 rounded-lg select-none">
                                                                Utama
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="shrink-0 flex flex-col items-end gap-4 text-right self-stretch justify-between">
                                                    <div className="flex items-center gap-3.5 text-sm font-semibold">
                                                        <button 
                                                            onClick={() => handleOpenEditAddrModal(addr)}
                                                            className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                                                        >
                                                            Ubah
                                                        </button>
                                                        {!addr.is_primary && (
                                                            <>
                                                                <span className="text-slate-200 font-normal">|</span>
                                                                <button 
                                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                                    className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleSetPrimaryAddress(addr.id)}
                                                        disabled={addr.is_primary}
                                                        className={`px-4 py-2 border rounded-xl text-xs transition-all font-semibold cursor-pointer ${
                                                            addr.is_primary 
                                                                ? 'border-slate-200 text-slate-400 bg-slate-50/80 cursor-not-allowed' 
                                                                : 'border-slate-250 text-slate-600 hover:bg-slate-50 hover:border-slate-350'
                                                        }`}
                                                    >
                                                        Atur Sebagai Utama
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="flex-1 flex flex-col bg-slate-50/50">
                                {selectedOrder ? (
                                    /* Order Detail Page View */
                                    <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
                                        {/* Back navigation & Order Number */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(null);
                                                    setSelectedOrderTracking(null);
                                                }}
                                                className="flex items-center gap-2 text-slate-550 hover:text-[#ff5722] font-semibold text-sm transition-colors cursor-pointer group"
                                            >
                                                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                                <span>Kembali ke Daftar Pesanan</span>
                                            </button>
                                            
                                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                                <span className="text-xs text-slate-400 font-semibold">
                                                    No. Order: <span className="font-mono text-slate-700 font-bold text-sm">{selectedOrder.order_number}</span>
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadgeClass(selectedOrder.status)}`}>
                                                    {getStatusLabel(selectedOrder.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Address & Shipment Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                            {/* Delivery Address */}
                                            <div className="space-y-3">
                                                <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Alamat Pengiriman</h3>
                                                <div className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-100 space-y-1.5 text-xs sm:text-sm text-slate-650">
                                                    <p className="font-bold text-slate-850 text-sm">
                                                        {selectedOrder.shipment?.destination_contact_name || currentUser?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-450 font-medium">
                                                        {selectedOrder.shipment?.destination_contact_phone || currentUser?.phone}
                                                    </p>
                                                    <p className="leading-relaxed text-xs sm:text-sm mt-1">
                                                        {selectedOrder.shipment?.destination_address || selectedOrder.shipping_address || currentUser?.address}
                                                    </p>
                                                    {(selectedOrder.shipment?.destination_postal_code || currentUser?.postal_code) && (
                                                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                                                            Kode Pos: {selectedOrder.shipment?.destination_postal_code || currentUser?.postal_code}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Courier Info */}
                                            <div className="space-y-3">
                                                <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Informasi Pengiriman</h3>
                                                {selectedOrder.shipment ? (
                                                    <div className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-100 space-y-2.5 text-xs sm:text-sm text-slate-650">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-450 font-semibold text-xs">Jasa Kirim</span>
                                                            <span className="font-bold text-slate-700 uppercase">{selectedOrder.shipment.courier_company}</span>
                                                        </div>
                                                        {selectedOrder.shipment.courier_service && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-slate-450 font-semibold text-xs">Layanan</span>
                                                                <span className="font-semibold text-slate-700 uppercase">{selectedOrder.shipment.courier_service_name || selectedOrder.shipment.courier_service}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-450 font-semibold text-xs">No. Resi / Waybill</span>
                                                            {selectedOrder.shipment.waybill_id ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] sm:text-xs">{selectedOrder.shipment.waybill_id}</span>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCopyText(selectedOrder.shipment.waybill_id, selectedOrder.id + '-waybill');
                                                                        }}
                                                                        className="p-1 hover:bg-slate-200/50 rounded-md transition cursor-pointer text-slate-455 hover:text-slate-600"
                                                                        title="Salin Resi"
                                                                    >
                                                                        {copiedText === selectedOrder.id + '-waybill' ? (
                                                                            <Check size={12} className="text-emerald-500 stroke-[3px]" />
                                                                        ) : (
                                                                            <Copy size={12} />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-450 italic text-xs">Menunggu Nomor Resi</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-450 font-semibold text-xs">Ongkos Kirim</span>
                                                            <span className="font-bold text-slate-700">{fmt(selectedOrder.shipment.cost || selectedOrder.shipping_cost)}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-50/50 rounded-xl p-4.5 border border-slate-100 flex items-center justify-center min-h-[120px] text-center">
                                                        <p className="text-xs text-slate-400 italic">Data pengiriman belum tersedia.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tracking Timeline */}
                                        <div className="space-y-3 pb-6 border-b border-slate-100">
                                            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                                                <Truck size={16} className="text-[#ff5722]" />
                                                <span>Pelacakan Status Pengiriman</span>
                                            </h3>

                                            {trackingLoading ? (
                                                <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                                                    <Loader size={24} className="animate-spin text-[#ff5722]" />
                                                    <p className="text-xs font-semibold">Menghubungkan ke layanan Biteship...</p>
                                                </div>
                                            ) : selectedOrderTracking && selectedOrderTracking.tracking_history && selectedOrderTracking.tracking_history.length > 0 ? (
                                                <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                                                    <div className="relative border-l border-slate-200 ml-3.5 pl-6.5 space-y-6">
                                                        {selectedOrderTracking.tracking_history.map((event, idx) => {
                                                            const isLatest = idx === 0;
                                                            const eventTime = event.time || event.date_time || event.timestamp || '';
                                                            const formattedTime = eventTime ? new Date(eventTime).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : '';
                                                            
                                                            return (
                                                                <div key={idx} className="relative group">
                                                                    {/* Circle dot on line */}
                                                                    <span className={`absolute left-[-37px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center ${
                                                                        isLatest ? 'bg-[#ff5722] ring-4 ring-orange-100' : 'bg-slate-350'
                                                                    }`}>
                                                                        {isLatest && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                                                                    </span>
                                                                    
                                                                    <div className="space-y-1">
                                                                        <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                                                                            isLatest ? 'text-[#ff5722] font-bold' : 'text-slate-750'
                                                                        }`}>
                                                                            {event.note || event.description}
                                                                        </p>
                                                                        {formattedTime && (
                                                                            <p className="text-[11px] font-semibold text-slate-450">
                                                                                {formattedTime}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : selectedOrder.shipment?.waybill_id ? (
                                                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center text-slate-400">
                                                    <p className="text-xs sm:text-sm font-semibold text-slate-500">Nomor resi sudah terbit, menunggu update perjalanan paket dari kurir ekspedisi.</p>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center text-slate-400">
                                                    <p className="text-xs sm:text-sm font-semibold text-slate-500">
                                                        {selectedOrder.status === 'pending'
                                                            ? 'Lakukan pembayaran agar pesanan diproses dan nomor resi diterbitkan.'
                                                            : 'Penjual sedang memproses pesanan Anda. Nomor resi akan terbit otomatis.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Items & Reviews */}
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Rincian Produk</h3>
                                            
                                            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100/80 bg-white">
                                                {selectedOrder.items?.map(item => {
                                                    const review = getItemProductReview(item);
                                                    return (
                                                        <div key={item.id} className="p-5 sm:p-6 flex flex-col gap-4">
                                                            <div className="flex gap-4 items-start">
                                                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
                                                                    <img 
                                                                        src={getProductImageUrl(item)} 
                                                                        alt={item.product_name} 
                                                                        className="w-full h-full object-cover" 
                                                                        onError={e => { e.target.onerror = null; e.target.src = '/images/default-product.png'; }}
                                                                    />
                                                                </div>
                                                                <div className="grow space-y-1">
                                                                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate leading-snug">{item.product_name}</h4>
                                                                    <div className="text-slate-400 font-semibold text-[10px] sm:text-[11px] flex flex-wrap gap-x-2.5 items-center">
                                                                        {item.variant_name && <span>Varian: {item.variant_name}</span>}
                                                                        {item.variant_name && item.sku && <span className="text-slate-200">|</span>}
                                                                        {item.sku && <span>SKU: {item.sku}</span>}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-md inline-block">x{item.quantity}</div>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <div className="text-xs sm:text-sm font-bold text-[#ff5722]">{fmt(item.unit_price)}</div>
                                                                </div>
                                                            </div>

                                                            {/* Review Section */}
                                                            {selectedOrder.status === 'completed' && (
                                                                <div className="mt-2.5 pt-4 border-t border-slate-100/60 bg-slate-50/20 rounded-xl p-3">
                                                                    {review ? (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div className="flex items-center text-amber-400">
                                                                                        {[...Array(5)].map((_, i) => (
                                                                                            <Star 
                                                                                                key={i} 
                                                                                                size={12} 
                                                                                                className={i < review.rating ? "fill-amber-400 text-amber-400 animate-in zoom-in duration-300" : "text-slate-200 fill-transparent"} 
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                    <span className="text-[11px] font-bold text-slate-500">Anda menilai: {review.rating} Bintang</span>
                                                                                </div>
                                                                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                                                                    <CheckCircle size={10} className="stroke-[2.5]" />
                                                                                    Telah Dinilai
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            {review.comment && (
                                                                                <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-100/50 leading-relaxed shadow-3xs">
                                                                                    "{review.comment}"
                                                                                </p>
                                                                            )}

                                                                            {review.photo_url && (
                                                                                <div className="pt-1">
                                                                                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Lampiran Foto:</span>
                                                                                    <a href={review.photo_url} target="_blank" rel="noopener noreferrer" className="inline-block relative rounded-lg overflow-hidden border border-slate-200 group hover:border-[#ff5722] transition-colors bg-white p-1">
                                                                                        <img 
                                                                                            src={review.photo_url} 
                                                                                            alt="Review attachment" 
                                                                                            className="w-16 h-16 object-cover rounded-md group-hover:scale-102 transition-transform" 
                                                                                        />
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                                            <p className="text-xs text-slate-450 font-medium leading-relaxed">
                                                                                Pesanan sudah selesai! Bantu kami meningkatkan pelayanan dengan memberikan ulasan produk ini.
                                                                            </p>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReviewOrder(selectedOrder);
                                                                                    setReviewProduct({
                                                                                        product_id: item.productVariant?.product_id,
                                                                                        name: item.product_name,
                                                                                        variant_name: item.variant_name
                                                                                    });
                                                                                    setReviewRating(5);
                                                                                    setReviewComment('');
                                                                                    setReviewPhoto(null);
                                                                                    setReviewPhotoPreview(null);
                                                                                    setIsReviewModalOpen(true);
                                                                                }}
                                                                                className="px-4.5 py-1.5 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-xs text-white text-xs font-bold rounded-lg cursor-pointer transition active:scale-[0.98]"
                                                                            >
                                                                                Tulis Ulasan
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

                                        {/* Pricing Summary & Payment Status */}
                                        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                            {/* Left: Payment Status */}
                                            <div className="flex flex-col justify-center space-y-2">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status Pembayaran</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                                        selectedOrder.payment?.status === 'paid' 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                        {selectedOrder.payment?.status === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}
                                                    </span>
                                                    {selectedOrder.payment?.payment_method && (
                                                        <span className="text-xs font-bold text-slate-550 bg-white border border-slate-200 px-2 py-0.5 rounded-md uppercase">
                                                            {selectedOrder.payment.payment_method.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedOrder.status === 'pending' && (
                                                    <div className="pt-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePay(selectedOrder.id);
                                                            }}
                                                            className="px-5 py-2 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-md hover:shadow-orange-500/10 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center gap-2"
                                                            disabled={payLoading[selectedOrder.id]}
                                                        >
                                                            {payLoading[selectedOrder.id] ? (
                                                                <>
                                                                    <Loader size={12} className="animate-spin text-white" />
                                                                    <span>Memproses...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard size={13} className="stroke-[2.5]" />
                                                                    <span>Bayar Sekarang</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Cost breakdown */}
                                            <div className="space-y-2.5 text-xs sm:text-sm text-slate-655">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-450 font-semibold">Subtotal Produk</span>
                                                    <span className="font-semibold text-slate-700">{fmt(selectedOrder.subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-450 font-semibold">Biaya Pengiriman</span>
                                                    <span className="font-semibold text-slate-700">{fmt(selectedOrder.shipping_cost)}</span>
                                                </div>
                                                {Number(selectedOrder.discount) > 0 && (
                                                    <div className="flex justify-between text-emerald-600 font-medium">
                                                        <span className="font-semibold">Potongan Voucher</span>
                                                        <span>-{fmt(selectedOrder.discount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200/60">
                                                    <span className="text-slate-800 font-bold">Total Pembayaran</span>
                                                    <span className="text-base sm:text-lg font-black text-[#ff5722]">{fmt(selectedOrder.grand_total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Existing filter & order list view */
                                    <>
                                        {/* Horizontal Order State Tabs */}
                                        <div className="border-b border-slate-100 bg-white sticky top-0 z-10 flex overflow-x-auto scrollbar-none shadow-2xs">
                                            {[
                                                { id: 'all', label: 'Semua' },
                                                { id: 'pending', label: 'Belum Bayar' },
                                                { id: 'processing', label: 'Sedang Dikemas' },
                                                { id: 'shipping', label: 'Dikirim' },
                                                { id: 'completed', label: 'Selesai' },
                                                { id: 'cancelled', label: 'Dibatalkan' }
                                            ].map((filter) => {
                                                const isActive = orderFilter === filter.id;
                                                return (
                                                    <button
                                                        key={filter.id}
                                                        onClick={() => setOrderFilter(filter.id)}
                                                        className={`flex-1 min-w-[110px] text-center py-4.5 border-b-2 text-sm transition-all duration-200 font-semibold cursor-pointer whitespace-nowrap ${
                                                            isActive 
                                                                ? 'border-[#ff5722] text-[#ff5722] font-bold scale-[1.01]' 
                                                                : 'border-transparent text-slate-500 hover:text-[#ff5722]'
                                                        }`}
                                                    >
                                                        {filter.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Orders Lists */}
                                        <div className="p-5 flex flex-col gap-5">
                                            {ordersLoading ? (
                                                <div className="bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center py-24 text-[#ff5722] gap-3 shadow-sm">
                                                    <Loader size={32} className="animate-spin" />
                                                    <p className="text-sm font-semibold text-slate-400">Memuat riwayat belanja...</p>
                                                </div>
                                            ) : getFilteredOrders().length === 0 ? (
                                                <div className="bg-white rounded-xl border border-slate-100 text-center py-20 text-slate-400 shadow-sm">
                                                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ff5722] mx-auto mb-5">
                                                        <ShoppingBag size={28} className="opacity-80" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-500">Belum ada pesanan pada status ini</p>
                                                </div>
                                            ) : (
                                                getFilteredOrders().map(order => (
                                                    <div 
                                                        key={order.id} 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="bg-white border border-slate-100 rounded-xl shadow-xs flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                                                    >
                                                        {/* Store Header */}
                                                        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
                                                            <div className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                                                                <span className="bg-[#ff5722] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm">MALL</span>
                                                                <span>Putri Jaya Mobil</span>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`https://wa.me/${settings?.store_whatsapp || '6281234567890'}`, '_blank');
                                                                    }}
                                                                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ml-2.5 shadow-2xs hover:shadow-xs"
                                                                >
                                                                    <span>Chat</span>
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-3">
                                                                {order.shipment && order.shipment.waybill_id && (
                                                                    <span className="text-xs text-slate-450 font-semibold border-r border-slate-100 pr-3.5 flex items-center gap-1.5">
                                                                        <Truck size={13} className="text-slate-450" />
                                                                        <span>{order.shipment.courier_company.toUpperCase()}: <span className="font-mono text-slate-700 font-bold">{order.shipment.waybill_id}</span></span>
                                                                    </span>
                                                                )}
                                                                <span className="text-[#ff5722] font-bold text-xs uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-lg">
                                                                    {getStatusLabel(order.status)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Items details */}
                                                        <div className="divide-y divide-slate-100/60">
                                                            {order.items?.map(item => (
                                                                <div key={item.id} className="flex gap-4.5 p-6 items-start">
                                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
                                                                        <img 
                                                                            src={getProductImageUrl(item)} 
                                                                            alt={item.product_name} 
                                                                            className="w-full h-full object-cover" 
                                                                            onError={e => { e.target.onerror = null; e.target.src = '/images/default-product.png'; }}
                                                                        />
                                                                    </div>
                                                                    <div className="grow space-y-1.5 overflow-hidden">
                                                                        <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug truncate">{item.product_name}</h4>
                                                                        <div className="text-slate-400 font-semibold text-[11px] flex flex-wrap gap-x-2.5 items-center">
                                                                            {item.variant_name && <span>Varian: {item.variant_name}</span>}
                                                                            {item.variant_name && item.sku && <span className="text-slate-200">|</span>}
                                                                            {item.sku && <span>SKU: {item.sku}</span>}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-lg inline-block">x{item.quantity}</div>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <div className="text-sm font-semibold text-[#ff5722]">{fmt(item.unit_price)}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Price details and Actions */}
                                                        <div className="px-6 py-5 border-t border-slate-100 bg-orange-50/2 flex flex-col gap-4">
                                                            <div className="flex items-center justify-between w-full border-b border-slate-100/60 pb-4">
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-450 font-semibold">
                                                                    <span>No. Order:</span>
                                                                    <span className="font-mono text-slate-700 font-bold">{order.order_number}</span>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCopyText(order.order_number, order.id + '-order');
                                                                        }}
                                                                        className="p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer text-slate-400 hover:text-slate-655"
                                                                        title="Salin No. Order"
                                                                    >
                                                                        {copiedText === order.id + '-order' ? (
                                                                            <Check size={12} className="text-emerald-500 stroke-[3px]" />
                                                                        ) : (
                                                                            <Copy size={12} />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-slate-550 text-xs sm:text-sm font-medium">Total Pesanan:</span>
                                                                    <span className="text-lg sm:text-xl font-bold text-[#ff5722]">{fmt(order.grand_total)}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Footer Actions */}
                                                            <div className="flex justify-end items-center gap-3">
                                                                {order.status === 'pending' && (
                                                                    <>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handlePay(order.id);
                                                                            }}
                                                                            className="px-6 py-2.5 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-md hover:shadow-orange-500/10 text-white text-xs sm:text-sm font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                                                                            disabled={payLoading[order.id]}
                                                                        >
                                                                            {payLoading[order.id] ? (
                                                                                <>
                                                                                    <Loader size={13} className="animate-spin text-white" />
                                                                                    <span>Memproses...</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CreditCard size={14} className="stroke-[2.5]" />
                                                                                    <span>Bayar Sekarang</span>
                                                                                </>
                                                                            )}
                                                                        </button>

                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handlePaySimulate(order.id);
                                                                            }}
                                                                            className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-650 hover:shadow-md hover:shadow-emerald-500/10 text-white text-xs sm:text-sm font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                                                                            disabled={paySimulateLoading[order.id]}
                                                                        >
                                                                            {paySimulateLoading[order.id] ? (
                                                                                <>
                                                                                    <Loader size={13} className="animate-spin text-white" />
                                                                                    <span>Memproses...</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Check size={14} className="stroke-[2.5]" />
                                                                                    <span>Simulasikan Bayar (Test)</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {(order.status === 'processing' || order.status === 'shipping') && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleShipSimulate(order.id);
                                                                        }}
                                                                        className="px-6 py-2.5 bg-linear-to-r from-violet-650 to-indigo-650 hover:shadow-md hover:shadow-indigo-500/10 text-white text-xs sm:text-sm font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                                                                        disabled={shipSimulateLoading[order.id]}
                                                                    >
                                                                        {shipSimulateLoading[order.id] ? (
                                                                            <>
                                                                                <Loader size={13} className="animate-spin text-white" />
                                                                                <span>Memproses...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Truck size={14} className="stroke-[2.5]" />
                                                                                <span>Simulasikan Kirim & Terima (Test)</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Edit/Create Modal Overlay */}
            {isAddrModalOpen && (
                <div className="fixed inset-0 z-9999 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {addrModalMode === 'create' ? 'Tambah Alamat Baru' : 'Ubah Alamat'}
                            </span>
                            <button 
                                onClick={() => setIsAddrModalOpen(false)}
                                className="text-slate-450 hover:text-slate-700 font-bold w-6 h-6 flex items-center justify-center cursor-pointer transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Modal Form */}
                        <form onSubmit={handleAddressSubmit} className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                            {profileError && (
                                <div className="bg-red-50/60 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                                    <AlertCircle size={15} className="shrink-0 text-red-500" />
                                    <span>{profileError}</span>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Penerima</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white"
                                        value={addrName} 
                                        onChange={(e) => setAddrName(e.target.value)} 
                                        placeholder="Nama Lengkap" 
                                        disabled={profileLoading} 
                                        required 
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nomor HP Penerima</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white"
                                        value={addrPhone} 
                                        onChange={(e) => setAddrPhone(e.target.value)} 
                                        placeholder="Contoh: 08xxxxxxxxxx" 
                                        disabled={profileLoading} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Provinsi</label>
                                    <div className="relative flex items-center">
                                        <select
                                            className="w-full h-11 px-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none cursor-pointer appearance-none"
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
                                            disabled={profileLoading || loadingRegions.provinces}
                                            required
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 pointer-events-none text-slate-400">▼</span>
                                        {loadingRegions.provinces && (
                                            <Loader size={12} className="absolute right-9 animate-spin text-[#ff5722]" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kota / Kabupaten</label>
                                    <div className="relative flex items-center">
                                        <select
                                            className="w-full h-11 px-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none cursor-pointer disabled:opacity-60 appearance-none"
                                            value={addrCity}
                                            onChange={(e) => {
                                                setAddrCity(e.target.value);
                                                setAddrDistrict('');
                                                setAddrVillage('');
                                                setDistricts([]);
                                                setVillages([]);
                                            }}
                                            disabled={profileLoading || !addrProvince || loadingRegions.cities}
                                            required
                                        >
                                            <option value="">Pilih Kota/Kabupaten</option>
                                            {cities.map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 pointer-events-none text-slate-400">▼</span>
                                        {loadingRegions.cities && (
                                            <Loader size={12} className="absolute right-9 animate-spin text-[#ff5722]" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kecamatan</label>
                                    <div className="relative flex items-center">
                                        <select
                                            className="w-full h-11 px-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none cursor-pointer disabled:opacity-60 appearance-none"
                                            value={addrDistrict}
                                            onChange={(e) => {
                                                setAddrDistrict(e.target.value);
                                                setAddrVillage('');
                                                setVillages([]);
                                            }}
                                            disabled={profileLoading || !addrCity || loadingRegions.districts}
                                            required
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {districts.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 pointer-events-none text-slate-400">▼</span>
                                        {loadingRegions.districts && (
                                            <Loader size={12} className="absolute right-9 animate-spin text-[#ff5722]" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Desa / Kelurahan</label>
                                    <div className="relative flex items-center">
                                        <select
                                            className="w-full h-11 px-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none cursor-pointer disabled:opacity-60 appearance-none"
                                            value={addrVillage}
                                            onChange={(e) => setAddrVillage(e.target.value)}
                                            disabled={profileLoading || !addrDistrict || loadingRegions.villages}
                                            required
                                        >
                                            <option value="">Pilih Desa/Kelurahan</option>
                                            {villages.map(v => (
                                                <option key={v.id} value={v.name}>{v.name}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 pointer-events-none text-slate-400">▼</span>
                                        {loadingRegions.villages && (
                                            <Loader size={12} className="absolute right-9 animate-spin text-[#ff5722]" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Detail Alamat (Jalan, Blok, No. Rumah, RT/RW)</label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none min-h-[70px] resize-y bg-slate-50/20 focus:bg-white"
                                    value={addrDetail} 
                                    onChange={(e) => setAddrDetail(e.target.value)} 
                                    placeholder="Nama jalan, gedung, blok, nomor rumah, RT/RW, dsb."
                                    disabled={profileLoading}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kode Pos</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white"
                                        value={addrPostalCode} 
                                        onChange={(e) => setAddrPostalCode(e.target.value)} 
                                        placeholder="12345"
                                        disabled={profileLoading}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Latitude (Opsional)</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white"
                                        value={addrLatitude} 
                                        onChange={(e) => setAddrLatitude(e.target.value)} 
                                        placeholder="-6.1234"
                                        disabled={profileLoading}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Longitude (Opsional)</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white"
                                        value={addrLongitude} 
                                        onChange={(e) => setAddrLongitude(e.target.value)} 
                                        placeholder="106.1234"
                                        disabled={profileLoading}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-1.5 select-none">
                                <input 
                                    type="checkbox" 
                                    id="addrIsPrimary" 
                                    checked={addrIsPrimary} 
                                    onChange={(e) => setAddrIsPrimary(e.target.checked)}
                                    disabled={profileLoading || (addrModalMode === 'edit' && addrIsPrimary)}
                                    className="w-4.5 h-4.5 text-[#ff5722] border-slate-300 rounded-md focus:ring-[#ff5722]/20 cursor-pointer accent-[#ff5722]"
                                />
                                <label htmlFor="addrIsPrimary" className="text-sm font-semibold text-slate-655 cursor-pointer">
                                    Jadikan alamat utama / default pengiriman
                                </label>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddrModalOpen(false)}
                                    className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer"
                                    disabled={profileLoading}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-md hover:shadow-orange-500/10 text-white font-bold text-sm rounded-xl transition cursor-pointer"
                                    disabled={profileLoading}
                                >
                                    {profileLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Review Modal Overlay */}
            {isReviewModalOpen && reviewProduct && (
                <div className="fixed inset-0 z-9999 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                                Tulis Ulasan Produk
                            </span>
                            <button 
                                onClick={() => setIsReviewModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 font-bold w-6 h-6 flex items-center justify-center cursor-pointer transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Modal Form */}
                        <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-5">
                            {/* Product Info */}
                            <div className="flex gap-3 bg-slate-50 p-4.5 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-200 shrink-0">
                                    PJM
                                </div>
                                <div className="grow space-y-0.5 overflow-hidden">
                                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-tight truncate">{reviewProduct.name}</h4>
                                    {reviewProduct.variant_name && (
                                        <p className="text-[10px] font-semibold text-slate-450">Varian: {reviewProduct.variant_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Stars Rating */}
                            <div className="flex flex-col items-center gap-2 py-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pilih Penilaian Bintang</label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isLit = star <= (hoverRating || reviewRating);
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 cursor-pointer transition transform hover:scale-110 active:scale-95"
                                            >
                                                <Star 
                                                    size={32} 
                                                    className={`transition-colors ${
                                                        isLit 
                                                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_1px_2px_rgba(245,158,11,0.2)]' 
                                                            : 'text-slate-200 fill-transparent'
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-xs font-bold text-[#ff5722] mt-1 bg-orange-50 px-3 py-1 rounded-full">
                                    {reviewRating === 5 && 'Sangat Baik'}
                                    {reviewRating === 4 && 'Baik'}
                                    {reviewRating === 3 && 'Cukup'}
                                    {reviewRating === 2 && 'Buruk'}
                                    {reviewRating === 1 && 'Sangat Buruk'}
                                </span>
                            </div>

                            {/* Comment Textarea */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ulasan Anda</label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none min-h-[90px] resize-y bg-slate-50/20 focus:bg-white"
                                    value={reviewComment} 
                                    onChange={(e) => setReviewComment(e.target.value)} 
                                    placeholder="Bagikan penilaian Anda terhadap kualitas produk ini..."
                                    disabled={reviewLoading}
                                    maxLength={1000}
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lampirkan Foto (Opsional)</label>
                                
                                {reviewPhotoPreview ? (
                                    <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit animate-in fade-in duration-200">
                                        <img 
                                            src={reviewPhotoPreview} 
                                            alt="Preview" 
                                            className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReviewPhoto(null);
                                                setReviewPhotoPreview(null);
                                            }}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition cursor-pointer"
                                        >
                                            Hapus Foto
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/30 hover:bg-slate-50 transition duration-200">
                                            <div className="flex flex-col items-center justify-center pt-4 pb-4">
                                                <span className="text-xs font-bold text-slate-550 hover:text-[#ff5722]">Pilih File Gambar</span>
                                                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Format JPG, PNG, GIF (Maks. 2MB)</span>
                                            </div>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleReviewPhotoChange}
                                                disabled={reviewLoading}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer"
                                    disabled={reviewLoading}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-md hover:shadow-orange-500/10 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-2"
                                    disabled={reviewLoading}
                                >
                                    {reviewLoading ? (
                                        <>
                                            <Loader size={14} className="animate-spin text-white" />
                                            <span>Mengirim...</span>
                                        </>
                                    ) : (
                                        <span>Kirim Ulasan</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
