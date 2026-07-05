import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, Lock, Tag, ChevronRight } from 'lucide-react';
import { formatRupiah, getStoreName } from '../utils/helpers';
import useCartDrawer from '../hooks/useCartDrawer';
import '../../css/cart-drawer.css'; // Import external CSS

const SHOPEE_RED = '#c0001a';

export default function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    onUpdateQty,
    onRemoveItem,
    onCheckout,
    settings = {},
    selectedVoucher,
    setSelectedVoucher,
    voucherDiscount,
    setVoucherDiscount,
    selectedShippingVoucher,
    setSelectedShippingVoucher,
    shippingDiscount,
    setShippingDiscount
}) {
    const storeName = getStoreName(settings);
    if (!isOpen) return null;

    // Use custom hook for voucher and totals logic
    const {
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
    } = useCartDrawer({
        isOpen,
        cartItems,
        setSelectedVoucher,
        setVoucherDiscount,
        setSelectedShippingVoucher,
        setShippingDiscount
    });

    return (
        <div className="sc-drawer" style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
            {/* Backdrop */}
            <div
                className="sc-backdrop"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className="sc-panel"
                style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: '100%', maxWidth: '420px',
                    background: '#f5f5f5',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                }}
            >
                {/* Header */}
                <div className="sc-header">
                    <div className="sc-header-title">
                        <ShoppingCart size={18} />
                        <span>Keranjang</span>
                        {totalItems > 0 && (
                            <span className="sc-header-badge">{totalItems}</span>
                        )}
                    </div>
                    <button className="sc-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Promo Bar */}
                {cartItems.length > 0 && (
                    (selectedVoucher || selectedShippingVoucher) ? (
                        <div className="sc-promo-bar" onClick={() => setShowVoucherDrawer(true)} style={{ background: '#fff2f2' }}>
                            <Tag size={13} />
                            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Voucher Terpakai:
                                {selectedVoucher && (
                                    <span className="sc-header-badge" style={{ background: '#c0001a', padding: '2px 6px', fontSize: 10 }}>
                                        {selectedVoucher.code}
                                    </span>
                                )}
                                {selectedShippingVoucher && (
                                    <span className="sc-header-badge" style={{ background: '#22c55e', padding: '2px 6px', fontSize: 10 }}>
                                        {selectedShippingVoucher.code}
                                    </span>
                                )}
                            </span>
                            <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
                        </div>
                    ) : (
                        <div className="sc-promo-bar" onClick={() => setShowVoucherDrawer(true)}>
                            <Tag size={13} />
                            <span>Gunakan kode voucher untuk hemat lebih banyak</span>
                            <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
                        </div>
                    )
                )}

                {/* Body */}
                {cartItems.length === 0 ? (
                    <div className="sc-empty">
                        <div className="sc-empty-icon">
                            <ShoppingCart size={34} color={SHOPEE_RED} />
                        </div>
                        <div className="sc-empty-title">Keranjang Anda Masih Kosong</div>
                        <p className="sc-empty-sub">
                            Temukan produk otomotif & aksesoris terbaik<br />dan tambahkan ke keranjang Anda.
                        </p>
                        <button className="sc-empty-btn" onClick={onClose}>
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="sc-body">
                        {/* Seller group */}
                        <div style={{ marginBottom: 8, marginTop: 8 }}>
                            <div className="sc-seller-group">
                                <div className="sc-seller-header">
                                    <span className="sc-seller-tag">Official</span>
                                    <span>{storeName}</span>
                                </div>
                                {cartItems.map((item) => (
                                    <div
                                        key={`${item.product.id}-${item.variant}`}
                                        className="sc-item"
                                    >
                                        <div className="sc-item-img">
                                            <img src={item.product.image} alt={item.product.name} />
                                        </div>
                                        <div className="sc-item-info">
                                            <div className="sc-item-name">{item.product.name}</div>
                                            {item.variant && (
                                                <span className="sc-item-variant">Varian: {item.variant}</span>
                                            )}
                                            <div className="sc-item-bottom">
                                                <span className="sc-item-price">
                                                    {formatRupiah(item.product.price * item.quantity)}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="sc-qty-ctrl">
                                                        <button
                                                            className="sc-qty-btn"
                                                            onClick={() => onUpdateQty(item.product.id, item.variant, item.quantity - 1)}
                                                        >
                                                            <Minus size={10} />
                                                        </button>
                                                        <span className="sc-qty-val">{item.quantity}</span>
                                                        <button
                                                            className="sc-qty-btn"
                                                            onClick={() => onUpdateQty(item.product.id, item.variant, item.quantity + 1)}
                                                        >
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="sc-delete-btn"
                                                        onClick={() => onRemoveItem(item.product.id, item.variant)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Summary */}
                {cartItems.length > 0 && (
                    <div className="sc-footer">
                        <div className="sc-summary">
                            <div className="sc-summary-row">
                                <span>Subtotal ({totalItems} produk)</span>
                                <span style={{ color: '#222', fontWeight: 600 }}>{formatRupiah(totalPrice)}</span>
                            </div>
                            <div className="sc-summary-row">
                                <span>Diskon Voucher</span>
                                <span style={{ color: '#c0001a' }}>- {formatRupiah(voucherDiscount)}</span>
                            </div>
                            {selectedShippingVoucher && (
                                <div className="sc-summary-row">
                                    <span>Gratis Ongkir ({selectedShippingVoucher.code})</span>
                                    <span style={{ color: '#22c55e' }}>Potongan s.d. {formatRupiah(selectedShippingVoucher.value)}</span>
                                </div>
                            )}
                            <div className="sc-summary-total">
                                <span className="sc-total-label">Total Pembayaran</span>
                                <span className="sc-total-val">{formatRupiah(Math.max(0, totalPrice - voucherDiscount))}</span>
                            </div>
                        </div>

                        <div className="sc-action-bar">
                            <button className="sc-checkout-btn" onClick={onCheckout}>
                                Beli Sekarang ({totalItems})
                            </button>
                        </div>

                        <div className="sc-secure-note">
                            <Lock size={11} />
                            <span>Pembayaran Aman & Terenkripsi</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Voucher Drawer Sekunder ── */}
            {showVoucherDrawer && (
                <div className="vch-drawer-backdrop" onClick={() => setShowVoucherDrawer(false)}>
                    <div className="vch-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="vch-drawer-header">
                            <span className="vch-drawer-title">Pilih Voucher Diskon</span>
                            <button className="sc-close-btn" style={{ background: '#eee', color: '#333' }} onClick={() => setShowVoucherDrawer(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="vch-drawer-body">
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
                                    Gunakan
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
                                    const isDisabled = totalPrice < vch.min_spend;
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
                                                            setSelectedShippingVoucher(vch);
                                                            setShippingDiscount(0);
                                                        } else {
                                                            setSelectedVoucher(vch);
                                                            let disc = 0;
                                                            if (vch.type === 'percent') {
                                                                disc = totalPrice * (vch.value / 100);
                                                                if (vch.max_discount && disc > vch.max_discount) disc = vch.max_discount;
                                                            } else {
                                                                disc = Math.min(vch.value, totalPrice);
                                                            }
                                                            setVoucherDiscount(disc);
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
        </div>
    );
}
