import React, { useState, useEffect } from 'react';
import Header from './Header';
import HeroCarousel from './HeroCarousel';
import Categories from './Categories';
import FlashSale from './FlashSale';
import ProductSection from './ProductSection';
import CartDrawer from './CartDrawer';
import ProductDetailPage from './ProductDetail';
import CheckoutPage from './CheckoutPage';
import CartPage from './CartPage';
import Footer from './Footer';
import FlashSalePage from './FlashSalePage';
import LoginPage from './LoginPage';
import UserProfilePage from './UserProfilePage';
import ChatWidget from './ChatWidget';
import { formatRupiah, getWhatsAppLink, getStoreName } from '../utils/helpers';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import WishlistDrawer from './WishlistDrawer';
import SkeletonLoader from './SkeletonLoader';

// Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useNotifications } from '../hooks/useNotifications';
import { useVouchers } from '../hooks/useVouchers';

function AppContent() {
    const { t } = useLanguage();
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get('page') || 'home';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [lastOrder, setLastOrder] = useState(null);
    const [selectedCartItems, setSelectedCartItems] = useState([]);

    const {
        currentUser, setCurrentUser, loginReason, setLoginReason,
        authChecked, setAuthChecked, handleLogout
    } = useAuth(initialPage);

    // wrapper for handleGoToLoginPage so we can pass navigateTo and setIsCartOpen
    const handleGoToLoginPageWrapper = (reason = '') => {
        setLoginReason(reason);
        navigateTo('login');
        setIsCartOpen(false);
    };

    const {
        isCartPageActive, isCheckoutActive, isFlashSalePageActive,
        isLoginPageActive, isUserProfileActive, selectedProduct,
        setSelectedProduct, setIsLoginPageActive, setIsUserProfileActive,
        setIsCheckoutActive, navigateTo
    } = useNavigation(initialPage, products, currentUser, handleGoToLoginPageWrapper);

    const {
        cart, setCart, saveCart, isCartOpen, setIsCartOpen,
        handleAddToCart, handleRemoveFromCart, handleUpdateCartQty, handleCheckout
    } = useCart(currentUser, handleGoToLoginPageWrapper, navigateTo, setSelectedCartItems);

    const {
        wishlist, isWishlistOpen, setIsWishlistOpen, handleToggleWishlist
    } = useWishlist(currentUser, products);

    const {
        notifications, unreadCount, handleNotificationClick,
        handleMarkAllNotificationsRead, handleDeleteNotification
    } = useNotifications(currentUser, navigateTo);

    const {
        selectedVoucher, setSelectedVoucher, voucherDiscount, setVoucherDiscount,
        selectedShippingVoucher, setSelectedShippingVoucher, shippingDiscount, setShippingDiscount
    } = useVouchers(cart);

    // Initial data fetch
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/categories').then(res => res.json()),
            fetch('/api/settings').then(res => res.json()),
            fetch('/api/auth/me').then(res => res.json()).catch(() => null)
        ])
        .then(([productsData, categoriesData, settingsData, meData]) => {
            setProducts(productsData);
            setCategories(categoriesData);
            setSettings(settingsData);
            if (meData && meData.id) {
                setCurrentUser(meData);
            } else {
                const p = new URLSearchParams(window.location.search);
                const page = p.get('page');
                if (page === 'profile' || page === 'checkout') {
                    setLoginReason(page);
                    setIsLoginPageActive(true);
                    setIsUserProfileActive(false);
                    setIsCheckoutActive(false);
                }
            }
            setAuthChecked(true);
            setLoading(false);

            // Handle initial product selection on page load if page=product
            const p = new URLSearchParams(window.location.search);
            const page = p.get('page');
            const prodId = p.get('product_id');
            if (page === 'product' && prodId) {
                const found = productsData.find(prod => prod.id === parseInt(prodId));
                if (found) setSelectedProduct(found);
            }
        })
        .catch(err => {
            console.error("Gagal mengambil data dari database:", err);
            setAuthChecked(true);
            setLoading(false);
        });
    }, []);

    const handleCartCheckout = (checkedItems, voucherData) => {
        if (!currentUser) {
            setLoginReason('checkout');
            navigateTo('login');
            return;
        }
        setSelectedCartItems(checkedItems);
        if (voucherData) {
            setSelectedVoucher(voucherData.voucher);
            setVoucherDiscount(voucherData.discount);
        }
        navigateTo('checkout');
    };

    const handleBuyNow = (product, quantity, variantName) => {
        if (!currentUser) {
            setLoginReason('checkout');
            navigateTo('login');
            return;
        }
        const mockItem = {
            product,
            quantity,
            variant: variantName || ''
        };
        setSelectedCartItems([mockItem]);
        // Reset voucher
        setSelectedVoucher(null);
        setVoucherDiscount(0);
        setSelectedShippingVoucher(null);
        setShippingDiscount(0);
        navigateTo('checkout');
    };

    const handleOrderSuccess = (orderData) => {
        setLastOrder(orderData);
        setIsCheckoutActive(false);
        window.history.pushState({}, '', '/');
        saveCart([]); // Kosongkan keranjang belanja
    };

    if (isLoginPageActive) {
        return (
            <LoginPage
                reason={loginReason}
                onBack={() => navigateTo('home')}
                onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    navigateTo(loginReason === 'checkout' ? 'checkout' : 'home');
                }}
                settings={settings}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
            <Header 
                settings={settings}
                currentUser={currentUser}
                cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
                cartItems={cart}
                wishlistCount={wishlist.length}
                onOpenWishlist={() => setIsWishlistOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                    setSearchQuery(q);
                    navigateTo('home');
                }}
                onOpenCart={() => navigateTo('cart')}
                onLogoClick={() => {
                    navigateTo('home');
                    setLastOrder(null);
                }}
                onLogout={() => handleLogout(() => navigateTo('home'))}
                onLoginClick={() => handleGoToLoginPageWrapper()}
                onProfileClick={() => {
                    navigateTo('profile');
                    setLastOrder(null);
                }}
                notifications={notifications}
                unreadCount={unreadCount}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onDeleteNotification={handleDeleteNotification}
            />

            <main className="grow pb-12">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    {loading ? (
                        <SkeletonLoader />
                    ) : isUserProfileActive ? (
                        <UserProfilePage
                            currentUser={currentUser}
                            onUpdateUser={(user) => setCurrentUser(user)}
                            onBack={() => navigateTo('home')}
                            settings={settings}
                            initialTab={new URLSearchParams(window.location.search).get('tab') || 'profile'}
                            onTabChange={(tabName) => navigateTo('profile', { tab: tabName })}
                        />
                    ) : lastOrder ? (
                        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 p-6 md:p-8 text-center space-y-6 shadow-xs animate-in fade-in zoom-in-95 duration-300 my-8">
                            <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Pesanan Berhasil!</h2>
                                <p className="text-xs text-slate-400 font-semibold">Pesanan Anda dengan ID <strong>#{lastOrder.order_id}</strong> telah berhasil dibuat. Silakan selesaikan pembayaran.</p>
                            </div>
                            
                            <div className="bg-slate-50 rounded-xl p-4.5 text-left text-xs font-semibold text-slate-655 border border-slate-100 space-y-3">
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">Penerima</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.address?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">No. Telepon</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.address?.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">Jasa Pengiriman</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.courier?.name || 'Kurir Toko'}</span>
                                </div>
                                <div className="flex justify-between pt-1 text-sm font-extrabold text-slate-800">
                                    <span>Total Pembayaran</span>
                                    <span className="text-red-650">{formatRupiah(lastOrder.total)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => { setLastOrder(null); navigateTo('home'); }}
                                    className="flex-1 bg-linear-to-r from-red-650 via-red-600 to-red-950 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:shadow-red-500/20 transition cursor-pointer text-xs uppercase tracking-wider"
                                >
                                    Belanja Lagi
                                </button>
                                <a
                                    href={getWhatsAppLink(
                                        settings,
                                        `Halo ${getStoreName(settings)}, saya baru saja memesan barang dengan ID #${lastOrder.order_id}. Mohon segera diproses.`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:shadow-emerald-500/10 transition flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
                                >
                                    Konfirmasi ke WA
                                </a>
                            </div>
                        </div>
                    ) : isCheckoutActive ? (
                        <CheckoutPage 
                            cart={selectedCartItems.length > 0 ? selectedCartItems : cart}
                            onBack={() => navigateTo('cart')}
                            onOrderSuccess={handleOrderSuccess}
                            currentUser={currentUser}
                            settings={settings}
                            initialSelectedVoucher={selectedVoucher}
                            initialVoucherDiscount={voucherDiscount}
                            initialSelectedShippingVoucher={selectedShippingVoucher}
                            initialShippingDiscount={shippingDiscount}
                            onVoucherChange={(v, disc) => {
                                setSelectedVoucher(v);
                                setVoucherDiscount(disc);
                            }}
                            onShippingVoucherChange={(v, disc) => {
                                setSelectedShippingVoucher(v);
                                setShippingDiscount(disc);
                            }}
                        />
                    ) : isCartPageActive ? (
                        <CartPage
                            cartItems={cart}
                            onUpdateQty={handleUpdateCartQty}
                            onRemoveItem={handleRemoveFromCart}
                            onCheckout={handleCartCheckout}
                            onBack={() => navigateTo('home')}
                            settings={settings}
                        />
                    ) : selectedProduct ? (
                        <ProductDetailPage 
                            product={selectedProduct} 
                            products={products}
                            onBack={() => navigateTo('home')} 
                            onProductClick={(prod) => navigateTo('product', { product_id: prod.id, product: prod })}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            settings={settings}
                            wishlist={wishlist}
                            onToggleWishlist={handleToggleWishlist}
                        />
                    ) : isFlashSalePageActive ? (
                        <FlashSalePage 
                            products={products}
                            settings={settings}
                            onBack={() => navigateTo('home')}
                            onProductClick={(prod) => navigateTo('product', { product_id: prod.id, product: prod })}
                            onAddToCart={handleAddToCart}
                        />
                    ) : (
                        <>
                            {/* Hero Banner Carousel */}
                            <HeroCarousel />

                            {/* Category Grid */}
                            <Categories 
                                categories={categories}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={(cat) => {
                                    setSelectedCategory(cat);
                                    navigateTo('home');
                                }}
                            />

                            {/* Flash Sale Banner */}
                            <FlashSale 
                                products={products} 
                                settings={settings} 
                                onProductClick={(prod) => navigateTo('product', { product_id: prod.id, product: prod })}
                                onSeeAll={() => navigateTo('flash-sale')}
                            />

                            {/* Products Section with filter & search */}
                             <ProductSection 
                                products={products}
                                searchQuery={searchQuery}
                                selectedCategory={selectedCategory}
                                onProductClick={(prod) => navigateTo('product', { product_id: prod.id, product: prod })}
                                onAddToCart={handleAddToCart}
                                wishlist={wishlist}
                                onToggleWishlist={handleToggleWishlist}
                                settings={settings}
                            />
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <Footer settings={settings} />

            {/* Shopping Cart Drawer */}
            <CartDrawer 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveFromCart}
                onCheckout={handleCheckout}
                settings={settings}
                selectedVoucher={selectedVoucher}
                setSelectedVoucher={setSelectedVoucher}
                voucherDiscount={voucherDiscount}
                setVoucherDiscount={setVoucherDiscount}
                selectedShippingVoucher={selectedShippingVoucher}
                setSelectedShippingVoucher={setSelectedShippingVoucher}
                shippingDiscount={shippingDiscount}
                setShippingDiscount={setShippingDiscount}
            />

            {/* Wishlist Drawer */}
            <WishlistDrawer 
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
                wishlistItems={wishlist}
                onRemoveItem={(id) => handleToggleWishlist({ id })}
                onAddToCart={handleAddToCart}
                settings={settings}
            />

            {/* Live Chat with Customer Service */}
            <ChatWidget 
                currentUser={currentUser} 
                onOpenLogin={handleGoToLoginPageWrapper} 
            />
        </div>
    );
}

export default function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}
