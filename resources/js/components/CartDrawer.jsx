import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, Lock, Tag, ChevronRight } from 'lucide-react';

const SHOPEE_RED = '#c0001a';

export default function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    onUpdateQty,
    onRemoveItem,
    onCheckout,
    settings = {}
}) {
    const whatsappNumber = settings.store_whatsapp || '6281234567890';
    const storeName = settings.store_name || 'Putri Jaya Mobil';
    if (!isOpen) return null;

    const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .sc-drawer * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
                @keyframes sc-slidein { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes sc-fadein { from { opacity: 0; } to { opacity: 1; } }

                .sc-backdrop { animation: sc-fadein 0.22s ease; }
                .sc-panel { animation: sc-slidein 0.28s cubic-bezier(0.22,1,0.36,1); }

                .sc-header {
                    background: #c0001a;
                    padding: 0 16px;
                    height: 56px;
                    display: flex; align-items: center; justify-content: space-between;
                    flex-shrink: 0;
                }
                .sc-header-title {
                    display: flex; align-items: center; gap: 8px;
                    color: #fff; font-size: 15px; font-weight: 700;
                }
                .sc-header-badge {
                    background: rgba(255,255,255,0.22);
                    border-radius: 10px;
                    padding: 1px 7px;
                    font-size: 11px; font-weight: 700; color: #fff;
                }
                .sc-close-btn {
                    background: rgba(255,255,255,0.15);
                    border: none; border-radius: 50%;
                    width: 30px; height: 30px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; cursor: pointer; transition: background 0.15s;
                }
                .sc-close-btn:hover { background: rgba(255,255,255,0.28); }

                /* Promo bar */
                .sc-promo-bar {
                    background: #fff9f9;
                    border-bottom: 1px solid #ffe5e5;
                    padding: 8px 16px;
                    display: flex; align-items: center; gap: 6px;
                    font-size: 11.5px; color: #c0001a; font-weight: 600;
                    flex-shrink: 0; cursor: pointer;
                }
                .sc-promo-bar:hover { background: #fff0f0; }

                /* Items */
                .sc-body {
                    flex: 1; overflow-y: auto; padding: 0;
                    background: #f5f5f5;
                }
                .sc-seller-group {
                    background: #fff;
                    margin-bottom: 8px;
                }
                .sc-seller-header {
                    padding: 10px 16px 6px;
                    display: flex; align-items: center; gap: 6px;
                    border-bottom: 1px solid #f5f5f5;
                    font-size: 12px; font-weight: 700; color: #222;
                }
                .sc-seller-tag {
                    background: #c0001a;
                    color: #fff; font-size: 9px; font-weight: 700;
                    padding: 1px 5px; border-radius: 2px;
                    letter-spacing: 0.3px;
                }
                .sc-item {
                    padding: 12px 16px;
                    display: flex; align-items: flex-start; gap: 10px;
                    border-bottom: 1px solid #f5f5f5;
                    position: relative;
                }
                .sc-item:last-child { border-bottom: none; }
                .sc-item-img {
                    width: 72px; height: 72px; border-radius: 4px;
                    overflow: hidden; flex-shrink: 0;
                    border: 1px solid #eee; background: #fafafa;
                }
                .sc-item-img img { width: 100%; height: 100%; object-fit: cover; }
                .sc-item-info { flex: 1; min-width: 0; }
                .sc-item-name {
                    font-size: 13px; font-weight: 500; color: #222;
                    line-height: 1.4; display: -webkit-box;
                    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .sc-item-variant {
                    display: inline-block;
                    font-size: 10.5px; color: #888; font-weight: 500;
                    background: #f5f5f5; border-radius: 2px;
                    padding: 2px 6px; margin-top: 4px;
                }
                .sc-item-bottom {
                    display: flex; align-items: center;
                    justify-content: space-between; margin-top: 8px;
                }
                .sc-item-price {
                    font-size: 14px; font-weight: 700; color: #c0001a;
                }
                .sc-qty-ctrl {
                    display: flex; align-items: center;
                    border: 1px solid #e0e0e0; border-radius: 2px;
                    overflow: hidden;
                }
                .sc-qty-btn {
                    background: #fff; border: none; cursor: pointer;
                    width: 26px; height: 26px;
                    display: flex; align-items: center; justify-content: center;
                    color: #555; transition: background 0.12s; font-size: 13px;
                }
                .sc-qty-btn:hover { background: #f5f5f5; }
                .sc-qty-val {
                    min-width: 30px; text-align: center;
                    font-size: 12px; font-weight: 600; color: #222;
                    border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;
                    height: 26px; line-height: 26px;
                }
                .sc-delete-btn {
                    background: none; border: none; cursor: pointer;
                    color: #bbb; padding: 4px; border-radius: 3px;
                    transition: color 0.15s; flex-shrink: 0;
                    display: flex; align-items: center;
                }
                .sc-delete-btn:hover { color: #c0001a; }

                /* Empty */
                .sc-empty {
                    flex: 1; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 48px 24px; text-align: center; background: #fff;
                }
                .sc-empty-icon {
                    width: 80px; height: 80px; background: #fff5f5;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; margin-bottom: 16px;
                }
                .sc-empty-title { font-size: 15px; font-weight: 700; color: #222; margin-bottom: 6px; }
                .sc-empty-sub { font-size: 12.5px; color: #999; line-height: 1.6; margin-bottom: 20px; }
                .sc-empty-btn {
                    background: #c0001a; color: #fff;
                    border: none; border-radius: 4px;
                    padding: 10px 28px; font-size: 13px; font-weight: 700;
                    cursor: pointer; transition: background 0.15s; font-family: 'Inter', sans-serif;
                }
                .sc-empty-btn:hover { background: #a30016; }

                /* Footer */
                .sc-footer { background: #fff; flex-shrink: 0; }
                .sc-summary {
                    padding: 12px 16px;
                    border-top: 1px solid #f0f0f0;
                }
                .sc-summary-row {
                    display: flex; justify-content: space-between; align-items: center;
                    font-size: 12px; color: #777; margin-bottom: 6px;
                }
                .sc-summary-total {
                    display: flex; justify-content: space-between; align-items: center;
                    padding-top: 10px; margin-top: 4px;
                    border-top: 1px solid #f0f0f0;
                }
                .sc-total-label { font-size: 13px; font-weight: 600; color: #333; }
                .sc-total-val { font-size: 18px; font-weight: 800; color: #c0001a; }
                .sc-action-bar {
                    padding: 12px 16px 16px;
                    display: flex; flex-direction: column; gap: 8px;
                }
                .sc-checkout-btn {
                    width: 100%; background: #c0001a; color: #fff;
                    border: none; border-radius: 4px;
                    padding: 14px; font-size: 14px; font-weight: 700;
                    cursor: pointer; transition: background 0.15s;
                    font-family: 'Inter', sans-serif; letter-spacing: 0.2px;
                }
                .sc-checkout-btn:hover { background: #a30016; }
                .sc-wa-btn {
                    width: 100%; background: #25d366; color: #fff;
                    border: none; border-radius: 4px;
                    padding: 11px; font-size: 13px; font-weight: 700;
                    cursor: pointer; transition: background 0.15s;
                    font-family: 'Inter', sans-serif; display: flex;
                    align-items: center; justify-content: center; gap: 6px;
                    text-decoration: none;
                }
                .sc-wa-btn:hover { background: #1fbb58; }
                .sc-secure-note {
                    display: flex; align-items: center; justify-content: center;
                    gap: 4px; font-size: 10.5px; color: #bbb;
                    padding: 0 16px 12px; font-weight: 500;
                }
            `}</style>

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
                        <div className="sc-promo-bar">
                            <Tag size={13} />
                            <span>Gunakan kode voucher untuk hemat lebih banyak</span>
                            <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
                        </div>
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
                                                        Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
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
                                    <span style={{ color: '#222', fontWeight: 600 }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="sc-summary-row">
                                    <span>Diskon Voucher</span>
                                    <span style={{ color: '#c0001a' }}>- Rp 0</span>
                                </div>
                                <div className="sc-summary-total">
                                    <span className="sc-total-label">Total Pembayaran</span>
                                    <span className="sc-total-val">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="sc-action-bar">
                                <button className="sc-checkout-btn" onClick={onCheckout}>
                                    Beli Sekarang ({totalItems})
                                </button>
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                                        `Halo ${storeName}, saya ingin memesan:\n` +
                                        cartItems.map(i => `- ${i.product.name} (${i.variant}) x${i.quantity}`).join('\n') +
                                        `\n\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sc-wa-btn"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.113.554 4.094 1.523 5.815L.057 23.428l5.806-1.522A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.847 0-3.584-.498-5.082-1.367l-.361-.215-3.745.982.999-3.648-.235-.374A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                    Order via WhatsApp
                                </a>
                            </div>

                            <div className="sc-secure-note">
                                <Lock size={11} />
                                <span>Pembayaran Aman & Terenkripsi</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
