import React from 'react';
import { ArrowLeft, Wallet, Check, Store } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';
import '../../css/checkout.css';

import AddressSelector from './Checkout/AddressSelector';
import ShippingSelector from './Checkout/ShippingSelector';
import OrderSummary from './Checkout/OrderSummary';
import useCheckoutPage from '../hooks/useCheckoutPage';

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
    const {
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
    } = useCheckoutPage({
        cart,
        onOrderSuccess,
        currentUser,
        settings,
        initialSelectedVoucher,
        initialVoucherDiscount,
        initialSelectedShippingVoucher,
        initialShippingDiscount
    });

    return (
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
                    <AddressSelector 
                        currentUser={currentUser} 
                        address={address} 
                        setAddress={setAddress}
                        addresses={addresses}
                        setAddresses={setAddresses}
                        addressesLoading={addressesLoading}
                        fetchAddresses={fetchAddresses}
                    />

                    {/* Products */}
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

                    <ShippingSelector 
                        address={address} 
                        cart={cart} 
                        selectedCourier={selectedCourier} 
                        setSelectedCourier={setSelectedCourier} 
                    />

                    {/* Payment Method */}
                    <div className="scp-card">
                        <div className="scp-card-header">
                            <Wallet size={16} color="#c0001a" />
                            <span className="scp-card-title">Metode Pembayaran</span>
                        </div>
                        <div className="scp-card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px solid #c0001a', borderRadius: '4px', background: '#fff9f9' }}>
                                <div style={{ background: '#c0001a', color: '#fff', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                {/* RIGHT: Summary */}
                <div>
                    <OrderSummary 
                        subtotal={subtotal}
                        shippingFee={shippingFee}
                        voucherDiscount={voucherDiscount}
                        shippingDiscount={shippingDiscount}
                        total={total}
                        selectedVoucher={selectedVoucher}
                        selectedShippingVoucher={selectedShippingVoucher}
                        setSelectedVoucher={setSelectedVoucher}
                        setSelectedShippingVoucher={setSelectedShippingVoucher}
                        setVoucherDiscount={setVoucherDiscount}
                        setShippingDiscount={setShippingDiscount}
                        onVoucherChange={onVoucherChange}
                        onShippingVoucherChange={onShippingVoucherChange}
                    />
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="scp-sticky-bar">
                <div className="scp-sticky-total">
                    <div className="scp-sticky-label">Total Pembayaran</div>
                    <div className="scp-sticky-val">{formatRupiah(total)}</div>
                </div>
                <button 
                    className="scp-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || !addressFilled || !selectedCourier}
                >
                    {loading ? 'Memproses...' : 'Buat Pesanan'}
                </button>
            </div>
        </div>
    );
}
