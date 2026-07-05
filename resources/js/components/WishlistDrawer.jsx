import React from 'react';
import { X, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { formatRupiah, getStoreName } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import '../../css/wishlist-drawer.css'; // Import external CSS

export default function WishlistDrawer({
    isOpen,
    onClose,
    wishlistItems,
    onRemoveItem,
    onAddToCart,
    settings = {}
}) {
    const { t } = useLanguage();
    const storeName = getStoreName(settings);
    if (!isOpen) return null;

    return (
        <div className="sw-drawer" style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
            {/* Backdrop */}
            <div
                className="sw-backdrop"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className="sw-panel"
                style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: '100%', maxWidth: '420px',
                    background: '#f5f5f5',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                }}
            >
                {/* Header */}
                <div className="sw-header">
                    <div className="sw-header-title">
                        <Heart size={18} fill="#fff" />
                        <span>{t('wishlist.title')}</span>
                        {wishlistItems.length > 0 && (
                            <span className="sw-header-badge">{wishlistItems.length}</span>
                        )}
                    </div>
                    <button className="sw-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                {wishlistItems.length === 0 ? (
                    <div className="sw-empty">
                        <div className="sw-empty-icon">
                            <Heart size={34} fill="#e11d48" color="#e11d48" />
                        </div>
                        <div className="sw-empty-title">{t('wishlist.empty')}</div>
                        <p className="sw-empty-sub">{t('wishlist.empty_desc')}</p>
                        <button className="sw-empty-btn" onClick={onClose}>
                            {t('wishlist.start_shopping')}
                        </button>
                    </div>
                ) : (
                    <div className="sw-body">
                        <div style={{ marginBottom: 8, marginTop: 8 }}>
                            <div className="sw-seller-group">
                                <div className="sw-seller-header">
                                    <span className="sw-seller-tag">Official</span>
                                    <span>{storeName}</span>
                                </div>
                                {wishlistItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="sw-item"
                                    >
                                        <div className="sw-item-img">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="sw-item-info">
                                            <div className="sw-item-name">{item.name}</div>
                                            <span className="sw-item-category">{item.category}</span>
                                            
                                            <div className="sw-item-bottom">
                                                <span className="sw-item-price">
                                                    {formatRupiah(item.price)}
                                                </span>
                                                <div className="sw-actions">
                                                    <button
                                                        className="sw-cart-btn"
                                                        onClick={() => {
                                                            onAddToCart(item, 1);
                                                            onRemoveItem(item.id);
                                                        }}
                                                        title={t('wishlist.add_to_cart')}
                                                    >
                                                        <ShoppingCart size={12} fill="#fff" />
                                                        <span>Cart</span>
                                                    </button>
                                                    <button
                                                        className="sw-delete-btn"
                                                        onClick={() => onRemoveItem(item.id)}
                                                        title={t('wishlist.remove')}
                                                    >
                                                        <Trash2 size={13} />
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
            </div>
        </div>
    );
}
