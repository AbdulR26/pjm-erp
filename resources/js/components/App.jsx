import React, { useState, useEffect } from 'react';
import Header from './Header';
import HeroCarousel from './HeroCarousel';
import Categories from './Categories';
import FlashSale from './FlashSale';
import ProductSection from './ProductSection';
import CartDrawer from './CartDrawer';
import ProductDetailPage from './ProductDetailPage';
import CheckoutPage from './CheckoutPage';
import Footer from './Footer';
import FlashSalePage from './FlashSalePage';
import LoginPage from './LoginPage';
import UserProfilePage from './UserProfilePage';
import ChatWidget from './ChatWidget';
import { formatRupiah, getCsrfToken, getWhatsAppLink, getStoreName } from '../utils/helpers';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import WishlistDrawer from './WishlistDrawer';
import SkeletonLoader from './SkeletonLoader';

function AppContent() {
    const { t } = useLanguage();
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get('page') || 'home';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutActive, setIsCheckoutActive] = useState(initialPage === 'checkout');
    const [lastOrder, setLastOrder] = useState(null);
    const [isFlashSalePageActive, setIsFlashSalePageActive] = useState(initialPage === 'flash-sale');
    const [currentUser, setCurrentUser] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoginPageActive, setIsLoginPageActive] = useState(initialPage === 'login');
    const [isUserProfileActive, setIsUserProfileActive] = useState(initialPage === 'profile');
    const [loginReason, setLoginReason] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [selectedShippingVoucher, setSelectedShippingVoucher] = useState(null);
    const [shippingDiscount, setShippingDiscount] = useState(0);

    // Auto-validate vouchers when cart updates
    useEffect(() => {
        const subtotal = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);

        if (selectedVoucher) {
            if (subtotal < selectedVoucher.min_spend) {
                setSelectedVoucher(null);
                setVoucherDiscount(0);
                alert(`Voucher diskon ${selectedVoucher.code} dilepas karena minimum belanja tidak terpenuhi.`);
            } else {
                let disc = 0;
                if (selectedVoucher.type === 'percent') {
                    disc = subtotal * (selectedVoucher.value / 100);
                    if (selectedVoucher.max_discount && disc > selectedVoucher.max_discount) {
                        disc = selectedVoucher.max_discount;
                    }
                } else {
                    disc = Math.min(selectedVoucher.value, subtotal);
                }
                setVoucherDiscount(disc);
            }
        }

        if (selectedShippingVoucher) {
            if (subtotal < selectedShippingVoucher.min_spend) {
                setSelectedShippingVoucher(null);
                setShippingDiscount(0);
                alert(`Voucher gratis ongkir ${selectedShippingVoucher.code} dilepas karena minimum belanja tidak terpenuhi.`);
            } else {
                setShippingDiscount(selectedShippingVoucher.value);
            }
        }
    }, [cart, selectedVoucher, selectedShippingVoucher]);

    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('pjm_wishlist');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    const handleToggleWishlist = (product) => {
        const isExist = wishlist.some((item) => item.id === product.id);
        let newWishlist;
        if (isExist) {
            newWishlist = wishlist.filter((item) => item.id !== product.id);
        } else {
            newWishlist = [...wishlist, product];
        }
        setWishlist(newWishlist);
        localStorage.setItem('pjm_wishlist', JSON.stringify(newWishlist));
    };

    const navigateTo = (pageName, extraParams = {}) => {
        const queryParams = new URLSearchParams();
        if (pageName && pageName !== 'home') {
            queryParams.set('page', pageName);
        }
        Object.keys(extraParams).forEach(key => {
            if (key !== 'product') {
                queryParams.set(key, extraParams[key]);
            }
        });
        
        const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : '/';
        window.history.pushState({}, '', newUrl);

        setIsUserProfileActive(pageName === 'profile');
        setIsLoginPageActive(pageName === 'login');
        setIsCheckoutActive(pageName === 'checkout');
        setIsFlashSalePageActive(pageName === 'flash-sale');
        
        if (pageName === 'product') {
            const productObj = extraParams.product || products.find(p => p.id === parseInt(extraParams.product_id));
            if (productObj) {
                setSelectedProduct(productObj);
            }
        } else {
            setSelectedProduct(null);
        }
    };

    // Listen to popstate event (browser Back/Forward buttons)
    useEffect(() => {
        const handlePopState = () => {
            const p = new URLSearchParams(window.location.search);
            const page = p.get('page') || 'home';
            const prodId = p.get('product_id');

            setIsUserProfileActive(page === 'profile');
            setIsLoginPageActive(page === 'login');
            setIsCheckoutActive(page === 'checkout');
            setIsFlashSalePageActive(page === 'flash-sale');

            if (page === 'product' && prodId && products.length > 0) {
                const found = products.find(prod => prod.id === parseInt(prodId));
                if (found) setSelectedProduct(found);
            } else {
                setSelectedProduct(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [products]);

    // Fetch data from database
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
            if (meData && meData.id) setCurrentUser(meData);
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

    // Load cart dari localStorage jika ada
    useEffect(() => {
        const savedCart = localStorage.getItem('pjm_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Simpan cart ke localStorage
    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('pjm_cart', JSON.stringify(newCart));
    };

    // ── Notification functions ──────────────────────────────────────────────
    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (e) { /* silently fail */ }
    };

    // Fetch notifications on auth check
    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [currentUser]);

    // Polling notifications setiap 30 detik
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleMarkNotificationRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': getCsrfToken() }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { /* silently fail */ }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': getCsrfToken() }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) { /* silently fail */ }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': getCsrfToken() }
            });
            setNotifications(prev => {
                const removed = prev.find(n => n.id === id);
                if (removed && !removed.is_read) setUnreadCount(c => Math.max(0, c - 1));
                return prev.filter(n => n.id !== id);
            });
        } catch (e) { /* silently fail */ }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
        if (notification.link) {
            const params = new URLSearchParams(notification.link.replace('?', ''));
            const page = params.get('page') || 'home';
            const extras = {};
            params.forEach((v, k) => { if (k !== 'page') extras[k] = v; });
            navigateTo(page, extras);
        }
    };

    const handleAddToCart = (product, quantity = 1, variant = '') => {
        const selectedVariant = variant || product.variants[0] || '';
        const existingItemIndex = cart.findIndex(
            (item) => item.product.id === product.id && item.variant === selectedVariant
        );

        let newCart = [...cart];
        if (existingItemIndex > -1) {
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart.push({
                product,
                quantity,
                variant: selectedVariant
            });
        }
        saveCart(newCart);
    };

    const handleRemoveFromCart = (productId, variant) => {
        const newCart = cart.filter(
            (item) => !(item.product.id === productId && item.variant === variant)
        );
        saveCart(newCart);
    };

    const handleUpdateCartQty = (productId, variant, newQty) => {
        if (newQty < 1) {
            handleRemoveFromCart(productId, variant);
            return;
        }
        const newCart = cart.map((item) => {
            if (item.product.id === productId && item.variant === variant) {
                return { ...item, quantity: newQty };
            }
            return item;
        });
        saveCart(newCart);
    };

    const handleCheckout = () => {
        if (!currentUser) {
            setLoginReason('checkout');
            navigateTo('login');
            setIsCartOpen(false);
            return;
        }
        navigateTo('checkout');
        setIsCartOpen(false);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': getCsrfToken() } });
        } catch (e) { /* silently fail */ }
        setCurrentUser(null);
        navigateTo('home');
    };

    const handleGoToLoginPage = (reason = '') => {
        setLoginReason(reason);
        navigateTo('login');
        setIsCartOpen(false);
    };

    const handleOrderSuccess = (orderData) => {
        setLastOrder(orderData);
        setIsCheckoutActive(false);
        window.history.pushState({}, '', '/');
        saveCart([]); // Kosongkan keranjang belanja
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
            <Header 
                settings={settings}
                currentUser={currentUser}
                cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
                wishlistCount={wishlist.length}
                onOpenWishlist={() => setIsWishlistOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                    setSearchQuery(q);
                    navigateTo('home');
                }}
                onOpenCart={() => setIsCartOpen(true)}
                onLogoClick={() => {
                    navigateTo('home');
                    setLastOrder(null);
                }}
                onLogout={handleLogout}
                onLoginClick={() => handleGoToLoginPage()}
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
                    ) : isLoginPageActive ? (
                        <LoginPage
                            reason={loginReason}
                            onBack={() => navigateTo('home')}
                            onLoginSuccess={(user) => {
                                setCurrentUser(user);
                                navigateTo(loginReason === 'checkout' ? 'checkout' : 'home');
                            }}
                        />
                    ) : lastOrder ? (
                        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 p-6 md:p-8 text-center space-y-6 shadow-xs animate-in fade-in zoom-in-95 duration-300 my-8">
                            <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Pesanan Berhasil Dibayar!</h2>
                                <p className="text-xs text-slate-400 font-semibold">Terima kasih atas pembayaran Anda melalui Midtrans. Pesanan sedang kami proses.</p>
                            </div>
                            
                            <div className="bg-slate-50 rounded-xl p-4.5 text-left text-xs font-semibold text-slate-655 border border-slate-100 space-y-3">
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">Penerima</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.address.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">No. Telepon</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.address.phone}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">Jasa Pengiriman</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.courier.name} ({lastOrder.courier.service})</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100/60 pb-2">
                                    <span className="text-slate-400">Metode Pembayaran</span>
                                    <span className="text-slate-800 font-bold">{lastOrder.paymentMethod}</span>
                                </div>
                                {lastOrder.discount > 0 && (
                                    <div className="flex justify-between border-b border-slate-100/60 pb-2 text-red-600 font-bold">
                                        <span>Potongan Voucher</span>
                                        <span>- {formatRupiah(lastOrder.discount)} ({lastOrder.voucher_code})</span>
                                    </div>
                                )}
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
                                        `Halo ${getStoreName(settings)}, saya sudah melakukan pembayaran melalui Midtrans sebesar ${formatRupiah(lastOrder.total)} untuk pesanan saya. Mohon segera diproses.`
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
                            cart={cart}
                            onBack={() => navigateTo('home')}
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
                    ) : selectedProduct ? (
                        <ProductDetailPage 
                            product={selectedProduct} 
                            onBack={() => navigateTo('home')} 
                            onAddToCart={handleAddToCart}
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
                onOpenLogin={handleGoToLoginPage} 
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
