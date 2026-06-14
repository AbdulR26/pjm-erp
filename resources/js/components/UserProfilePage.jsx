import React, { useState, useEffect } from 'react';
import { User, MapPin, ClipboardList, CreditCard, Truck, AlertCircle, CheckCircle, ArrowLeft, Phone, Mail, ChevronRight, ShoppingBag } from 'lucide-react';

export default function UserProfilePage({ currentUser, onUpdateUser, onBack, settings }) {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'address' | 'orders'
    const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'
    
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
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    // Orders State
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [payLoading, setPayLoading] = useState({});


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
                body: JSON.stringify({ name, phone, address })
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

    // Filter orders locally based on status tab
    const getFilteredOrders = () => {
        if (orderFilter === 'all') return orders;
        return orders.filter(o => o.status === orderFilter);
    };

    const fmt = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

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

    return (
        <div style={{
            minHeight: '75vh',
            padding: '32px 16px',
            fontFamily: "'Inter', sans-serif",
            animation: 'shopee-page-fadein 0.3s ease',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                @keyframes shopee-page-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                
                .sh-back-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    color: #dc2626; font-size: 13px; font-weight: 600;
                    background: none; border: none; cursor: pointer;
                    padding: 0; margin-bottom: 24px;
                    transition: opacity 0.15s;
                }
                .sh-back-btn:hover { opacity: 0.75; }

                .sh-container {
                    display: flex;
                    gap: 24px;
                    max-width: 1100px;
                    margin: 0 auto;
                }
                
                @media (max-width: 768px) {
                    .sh-container { flex-direction: column; }
                    .sh-sidebar { width: 100% !important; }
                    .sh-content { width: 100% !important; }
                }

                .sh-sidebar {
                    width: 240px;
                    flex-shrink: 0;
                }

                .sh-sidebar-user {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 0 20px;
                    border-bottom: 1px solid #eef0f2;
                }
                .sh-user-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    color: #888;
                }
                .sh-user-name {
                    font-size: 14px;
                    font-weight: 750;
                    color: #333;
                    max-width: 160px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sh-menu-list {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .sh-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 11px 16px;
                    background: none;
                    border: none;
                    text-align: left;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #555;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .sh-menu-item:hover {
                    color: #dc2626;
                    background: #fff1f2;
                }
                .sh-menu-item.active {
                    color: #dc2626;
                    background: #fff1f2;
                }

                .sh-content {
                    flex-grow: 1;
                    background: #fff;
                    border-radius: 6px;
                    box-shadow: 0 1px 12px rgba(0,0,0,0.06);
                    border: 1px solid #eef0f2;
                    min-height: 500px;
                    overflow: hidden;
                }

                .sh-content-header {
                    padding: 20px 30px;
                    border-bottom: 1px solid #f0f2f5;
                }
                .sh-content-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #222;
                }
                .sh-content-sub {
                    font-size: 13px;
                    color: #888;
                    margin-top: 4px;
                }

                .sh-form-body {
                    padding: 30px;
                    max-width: 600px;
                }

                .sh-input-group {
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .sh-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #555;
                }
                .sh-input {
                    padding: 11px 14px;
                    border: 1.5px solid #e0e0e0;
                    border-radius: 4px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.15s;
                    font-family: 'Inter', sans-serif;
                }
                .sh-input:focus {
                    border-color: #dc2626;
                }
                .sh-input:disabled {
                    background: #f8f9fa;
                    color: #888;
                    cursor: not-allowed;
                }
                .sh-textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                .sh-save-btn {
                    background: #dc2626;
                    color: #fff;
                    font-weight: 700;
                    font-size: 14px;
                    padding: 11px 24px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .sh-save-btn:hover:not(:disabled) {
                    background: #b91c1c;
                }
                .sh-save-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .sh-alert-success {
                    background: #ecfdf5;
                    border: 1px solid #d1fae5;
                    color: #065f46;
                    padding: 12px;
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: 650;
                    margin-bottom: 20px;
                }
                .sh-alert-error {
                    background: #fef2f2;
                    border: 1px solid #fee2e2;
                    color: #991b1b;
                    padding: 12px;
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: 650;
                    margin-bottom: 20px;
                }

                /* ---- Order Tabs ---- */
                .sh-order-tabs {
                    display: flex;
                    border-bottom: 1px solid #f0f2f5;
                    overflow-x: auto;
                }
                .sh-order-tab {
                    flex-shrink: 0;
                    padding: 16px 20px;
                    background: none;
                    border: none;
                    font-size: 13px;
                    font-weight: 600;
                    color: #555;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.15s;
                }
                .sh-order-tab:hover {
                    color: #dc2626;
                }
                .sh-order-tab.active {
                    color: #dc2626;
                    border-bottom-color: #dc2626;
                    font-weight: 750;
                }
                
                .sh-orders-container {
                    padding: 20px 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: #fdfdfd;
                    min-height: 400px;
                }
                .sh-order-card {
                    background: #fff;
                    border: 1px solid #eef0f2;
                    border-radius: 6px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
                    overflow: hidden;
                }
                .sh-order-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 18px;
                    background: #fafafa;
                    border-bottom: 1px solid #eef0f2;
                }
                .sh-order-meta {
                    font-size: 12px;
                    color: #666;
                    font-weight: 600;
                }
                .sh-order-status {
                    font-size: 11px;
                    font-weight: 750;
                    text-transform: uppercase;
                    padding: 3px 8px;
                    border-radius: 4px;
                }

                .sh-order-item {
                    display: flex;
                    gap: 14px;
                    padding: 16px 18px;
                    border-bottom: 1px solid #f4f6f8;
                }
                .sh-order-item:last-child {
                    border-bottom: none;
                }
                .sh-item-name {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #333;
                }
                .sh-item-details {
                    font-size: 11.5px;
                    color: #888;
                    margin-top: 2px;
                }

                .sh-order-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 18px;
                    border-top: 1px solid #eef0f2;
                    background: #fcfcfc;
                }
                .sh-order-total-label {
                    font-size: 12px;
                    color: #777;
                    font-weight: 600;
                }
                .sh-order-total-val {
                    font-size: 16px;
                    font-weight: 900;
                    color: #dc2626;
                }
                
                .sh-pay-btn {
                    background: #dc2626;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 750;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .sh-pay-btn:hover {
                    background: #b91c1c;
                }
                
                .sh-spinner-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 0;
                    color: #dc2626;
                    gap: 12px;
                }
                .sh-spinner {
                    width: 28px;
                    height: 28px;
                    border: 3px solid rgba(220,38,38,0.2);
                    border-top-color: #dc2626;
                    border-radius: 50%;
                    animation: sh-spin 0.6s linear infinite;
                }
                @keyframes sh-spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Back Button */}
            <button className="sh-back-btn" onClick={onBack}>
                <ArrowLeft size={14} />
                <span>Kembali Belanja</span>
            </button>

            <div className="sh-container">
                {/* Sidebar */}
                <div className="sh-sidebar">
                    <div className="sh-sidebar-user">
                        <div className="sh-user-avatar">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={22} />
                            )}
                        </div>
                        <div>
                            <div className="sh-user-name">{currentUser?.name}</div>
                            <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>Level: Retail</span>
                        </div>
                    </div>

                    <div className="sh-menu-list">
                        <button 
                            className={`sh-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={16} />
                            <span>Profil Saya</span>
                        </button>
                        <button 
                            className={`sh-menu-item ${activeTab === 'address' ? 'active' : ''}`}
                            onClick={() => setActiveTab('address')}
                        >
                            <MapPin size={16} />
                            <span>Alamat Pengiriman</span>
                        </button>
                        <button 
                            className={`sh-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ClipboardList size={16} />
                            <span>Pesanan Saya</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="sh-content">
                    {activeTab === 'profile' && (
                        <>
                            <div className="sh-content-header">
                                <h3 className="sh-content-title">Profil Saya</h3>
                                <p className="sh-content-sub">Kelola informasi profil Anda untuk keamanan akun</p>
                            </div>
                            <div className="sh-form-body">
                                {profileSuccess && <div className="sh-alert-success">{profileSuccess}</div>}
                                {profileError && <div className="sh-alert-error">{profileError}</div>}
                                
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="sh-input-group">
                                        <label className="sh-label">Alamat Email (Tidak dapat diubah)</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#aaa' }} />
                                            <input type="email" className="sh-input" style={{ width: '100%', paddingLeft: '36px' }} value={currentUser?.email || ''} disabled />
                                        </div>
                                    </div>
                                    <div className="sh-input-group">
                                        <label className="sh-label">Nama Lengkap</label>
                                        <input type="text" className="sh-input" value={name} onChange={(e) => setName(e.target.value)} disabled={profileLoading} required />
                                    </div>
                                    <div className="sh-input-group">
                                        <label className="sh-label">Nomor WhatsApp</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Phone size={16} style={{ position: 'absolute', left: '12px', color: '#aaa' }} />
                                            <input type="tel" className="sh-input" style={{ width: '100%', paddingLeft: '36px' }} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={profileLoading} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="sh-save-btn" disabled={profileLoading}>
                                        {profileLoading ? 'Menyimpan...' : 'Simpan Profil'}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {activeTab === 'address' && (
                        <>
                            <div className="sh-content-header">
                                <h3 className="sh-content-title">Alamat Pengiriman</h3>
                                <p className="sh-content-sub">Kelola alamat lengkap pengiriman pesanan Anda</p>
                            </div>
                            <div className="sh-form-body">
                                {profileSuccess && <div className="sh-alert-success">{profileSuccess}</div>}
                                {profileError && <div className="sh-alert-error">{profileError}</div>}
                                
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="sh-input-group">
                                        <label className="sh-label">Alamat Lengkap Rumah / Toko</label>
                                        <textarea 
                                            className="sh-input sh-textarea" 
                                            value={address} 
                                            onChange={(e) => setAddress(e.target.value)} 
                                            placeholder="Contoh: Jl. Diponegoro No. 12, Kel. Bekasi Jaya, Kec. Bekasi Timur, Kota Bekasi, Jawa Barat"
                                            disabled={profileLoading}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="sh-save-btn" disabled={profileLoading}>
                                        {profileLoading ? 'Menyimpan...' : 'Simpan Alamat'}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {activeTab === 'orders' && (
                        <>
                            <div className="sh-content-header">
                                <h3 className="sh-content-title">Pesanan Saya</h3>
                                <p className="sh-content-sub">Pantau status transaksi dan pelacakan paket pesanan Anda</p>
                            </div>
                            
                            {/* Order Tabs */}
                            <div className="sh-order-tabs">
                                <button className={`sh-order-tab ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>Semua</button>
                                <button className={`sh-order-tab ${orderFilter === 'pending' ? 'active' : ''}`} onClick={() => setOrderFilter('pending')}>Belum Bayar</button>
                                <button className={`sh-order-tab ${orderFilter === 'processing' ? 'active' : ''}`} onClick={() => setOrderFilter('processing')}>Diproses</button>
                                <button className={`sh-order-tab ${orderFilter === 'shipping' ? 'active' : ''}`} onClick={() => setOrderFilter('shipping')}>Dikirim</button>
                                <button className={`sh-order-tab ${orderFilter === 'completed' ? 'active' : ''}`} onClick={() => setOrderFilter('completed')}>Selesai</button>
                                <button className={`sh-order-tab ${orderFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setOrderFilter('cancelled')}>Dibatalkan</button>
                            </div>

                            {/* Orders List */}
                            <div className="sh-orders-container">
                                {ordersLoading ? (
                                    <div className="sh-spinner-container">
                                        <div className="sh-spinner" />
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>Memuat riwayat belanja...</p>
                                    </div>
                                ) : getFilteredOrders().length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                                        <ShoppingBag size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                        <p style={{ fontSize: '13.5px', fontWeight: 600 }}>Belum ada pesanan pada status ini</p>
                                    </div>
                                ) : (
                                    getFilteredOrders().map(order => (
                                        <div key={order.id} className="sh-order-card">
                                            {/* Card Header */}
                                            <div className="sh-order-card-header">
                                                <div className="sh-order-meta">
                                                    <span>No. Order: {order.order_number}</span>
                                                    <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                                                    <span>Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <span className={`sh-order-status ${getStatusBadgeClass(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>

                                            {/* Items */}
                                            <div>
                                                {order.items?.map(item => (
                                                    <div key={item.id} className="sh-order-item">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-red-500 font-bold" style={{ fontSize: '11px' }}>PJM</div>
                                                        <div style={{ flexGrow: 1 }}>
                                                            <div className="sh-item-name">{item.product_name}</div>
                                                            <div className="sh-item-details">Varian: {item.variant_name || '-'} | SKU: {item.sku || '-'}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>{fmt(item.total_price)}</div>
                                                            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{item.quantity} x {fmt(item.unit_price)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Courier Waybill Details */}
                                            {order.shipment && (
                                                <div style={{ padding: '10px 18px', background: '#fafbfc', borderTop: '1px solid #f0f2f5', borderBottom: '1px solid #f0f2f5', fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                    <div>
                                                        <strong>Kurir:</strong> {order.shipment.courier_service_name || `${order.shipment.courier_company.toUpperCase()} ${order.shipment.courier_service}`}
                                                    </div>
                                                    <div>
                                                        <strong>No. Resi:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#333' }}>{order.shipment.waybill_id || 'Belum tersedia'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer & Actions */}
                                            <div className="sh-order-card-footer">
                                                <div>
                                                    <span className="sh-order-total-label">Total Belanja: </span>
                                                    <span className="sh-order-total-val">{fmt(order.grand_total)}</span>
                                                </div>
                                                <div>
                                                    {order.status === 'pending' && (
                                                        <button 
                                                            className="sh-pay-btn flex items-center gap-1.5"
                                                            onClick={() => handlePay(order.id)}
                                                            disabled={payLoading[order.id]}
                                                        >
                                                            {payLoading[order.id] ? (
                                                                <>
                                                                    <div className="sh-spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderTopColor: '#fff', margin: 0 }} />
                                                                    <span>Memproses...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard size={13} />
                                                                    <span>Bayar Sekarang</span>
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
            </div>
        </div>
    );
}
