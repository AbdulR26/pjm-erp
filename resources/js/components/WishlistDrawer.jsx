import React from 'react';
import { X, Heart, Trash2, ShoppingCart, Lock } from 'lucide-react';
import { formatRupiah, getStoreName } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .sw-drawer * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
                @keyframes sw-slidein { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes sw-fadein { from { opacity: 0; } to { opacity: 1; } }

                .sw-backdrop { animation: sw-fadein 0.22s ease; }
                .sw-panel { animation: sw-slidein 0.28s cubic-bezier(0.22,1,0.36,1); }

                .sw-header {
                    background: #e11d48; /* Rose-600 */
                    padding: 0 16px;
                    height: 56px;
                    display: flex; align-items: center; justify-content: space-between;
                    flex-shrink: 0;
                }
                .sw-header-title {
                    display: flex; align-items: center; gap: 8px;
                    color: #fff; font-size: 15px; font-weight: 700;
                }
                .sw-header-badge {
                    background: rgba(255,255,255,0.22);
                    border-radius: 10px;
                    padding: 1px 7px;
                    font-size: 11px; font-weight: 700; color: #fff;
                }
                .sw-close-btn {
                    background: rgba(255,255,255,0.15);
                    border: none; border-radius: 50%;
                    width: 30px; height: 30px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; cursor: pointer; transition: background 0.15s;
                }
                .sw-close-btn:hover { background: rgba(255,255,255,0.28); }

                /* Items */
                .sw-body {
                    flex: 1; overflow-y: auto; padding: 0;
                    background: #f5f5f5;
                }
                .sw-seller-group {
                    background: #fff;
                    margin-bottom: 8px;
                }
                .sw-seller-header {
                    padding: 10px 16px 6px;
                    display: flex; align-items: center; gap: 6px;
                    border-bottom: 1px solid #f5f5f5;
                    font-size: 12px; font-weight: 700; color: #222;
                }
                .sw-seller-tag {
                    background: #e11d48;
                    color: #fff; font-size: 9px; font-weight: 700;
                    padding: 1px 5px; border-radius: 2px;
                    letter-spacing: 0.3px;
                }
                .sw-item {
                    padding: 12px 16px;
                    display: flex; align-items: flex-start; gap: 10px;
                    border-bottom: 1px solid #f5f5f5;
                    position: relative;
                }
                .sw-item:last-child { border-bottom: none; }
                .sw-item-img {
                    width: 72px; height: 72px; border-radius: 4px;
                    overflow: hidden; flex-shrink: 0;
                    border: 1px solid #eee; background: #fafafa;
                }
                .sw-item-img img { width: 100%; height: 100%; object-fit: cover; }
                .sw-item-info { flex: 1; min-width: 0; }
                .sw-item-name {
                    font-size: 13px; font-weight: 500; color: #222;
                    line-height: 1.4; display: -webkit-box;
                    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .sw-item-category {
                    display: inline-block;
                    font-size: 9.5px; color: #e11d48; font-weight: 700;
                    background: #fff1f2; border-radius: 2px;
                    padding: 1px 5px; margin-top: 4px;
                    text-transform: uppercase;
                }
                .sw-item-bottom {
                    display: flex; align-items: center;
                    justify-content: space-between; margin-top: 8px;
                }
                .sw-item-price {
                    font-size: 14px; font-weight: 700; color: #222;
                }
                .sw-actions {
                    display: flex; align-items: center; gap: 6px;
                }
                .sw-cart-btn {
                    background: #e11d48; color: #fff; border: none; cursor: pointer;
                    height: 28px; border-radius: 4px; font-size: 11px; font-weight: 700;
                    padding: 0 10px; display: flex; align-items: center; gap: 4px;
                    transition: background 0.12s;
                }
                .sw-cart-btn:hover { background: #be123c; }
                .sw-delete-btn {
                    background: #f1f5f9; border: none; cursor: pointer;
                    color: #ef4444; padding: 6px; border-radius: 4px;
                    transition: background 0.15s; flex-shrink: 0;
                    display: flex; align-items: center;
                }
                .sw-delete-btn:hover { background: #fee2e2; }

                /* Empty */
                .sw-empty {
                    flex: 1; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 48px 24px; text-align: center; background: #fff;
                }
                .sw-empty-icon {
                    width: 80px; height: 80px; background: #fff1f2;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; margin-bottom: 16px;
                }
                .sw-empty-title { font-size: 15px; font-weight: 700; color: #222; margin-bottom: 6px; }
                .sw-empty-sub { font-size: 12.5px; color: #999; line-height: 1.6; margin-bottom: 20px; }
                .sw-empty-btn {
                    background: #e11d48; color: #fff;
                    border: none; border-radius: 4px;
                    padding: 10px 28px; font-size: 13px; font-weight: 700;
                    cursor: pointer; transition: background 0.15s; font-family: 'Inter', sans-serif;
                }
                .sw-empty-btn:hover { background: #be123c; }
            `}</style>

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
        </>
    );
}
