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

// Data produk otomotif premium Putri Jaya Mobil
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: 'Kampas Rem Depan Bendix General CT Ceramic',
        category: 'Rem & Transmisi',
        price: 420000,
        originalPrice: 480000,
        discount: 12,
        rating: 4.8,
        sold: 340,
        image: 'https://images.unsplash.com/photo-1606577924006-27d39b132c2a?auto=format&fit=crop&w=600&q=80',
        badge: 'Terlaris',
        description: 'Kampas rem depan Bendix General CT dengan Ceramic Technology. Memberikan daya cengkram rem yang sangat pakem, sunyi tanpa suara decitan, dan tidak menimbulkan debu hitam pada velg mobil Anda.',
        specs: {
            'Merk': 'Bendix Original',
            'Tipe': 'General CT (Ceramic)',
            'Kendaraan': 'Avanza, Xenia, Rush, Terios (2004-2021)',
            'Posisi': 'Roda Depan'
        },
        variants: ['Avanza/Xenia', 'Innova Gas/Diesel', 'Jazz/Yaris']
    },
    {
        id: 2,
        name: 'Shockbreaker Tein EnduraPro Plus (Set Depan)',
        category: 'Kaki-Kaki',
        price: 5800000,
        originalPrice: 6500000,
        discount: 10,
        rating: 4.9,
        sold: 48,
        image: 'https://images.unsplash.com/photo-1635773054018-22c2005e8e80?auto=format&fit=crop&w=600&q=80',
        badge: 'Premium',
        description: 'Shockbreaker premium Tein EnduraPro Plus dilengkapi dengan setelan tingkat kekerasan (16-level Damping Force Adjustment). Dirancang khusus untuk menggantikan shockbreaker standar bawaan pabrik guna kenyamanan berkendara yang jauh lebih stabil dan empuk.',
        specs: {
            'Merk': 'Tein Japan',
            'Tipe': 'EnduraPro Plus (Adjustable)',
            'Kendaraan': 'Toyota Fortuner / Mitsubishi Pajero Sport',
            'Isi Paket': '2 Pcs Shockbreaker Depan'
        },
        variants: ['Fortuner VRZ', 'Pajero Sport Dac']
    },
    {
        id: 3,
        name: 'Filter Udara K&N Replacement Drop-In',
        category: 'Mesin',
        price: 1250000,
        originalPrice: 1390000,
        discount: 10,
        rating: 5.0,
        sold: 92,
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
        badge: 'Lifetime Wash',
        description: 'Filter udara K&N original buatan USA. Terbuat dari bahan katun khusus berkepadatan tinggi yang mampu mengalirkan udara bersih lebih banyak ke ruang bakar, meningkatkan performa mesin, dan dapat dicuci berulang kali untuk pemakaian seumur hidup.',
        specs: {
            'Merk': 'K&N USA Original',
            'Tipe': 'Replacement Drop-In',
            'Kendaraan': 'Honda Civic Turbo / CR-V Turbo',
            'Perawatan': 'Dicuci per 15.000 km'
        },
        variants: ['Civic Turbo', 'Innova Reborn Diesel', 'Fortuner VRZ']
    },
    {
        id: 4,
        name: 'Velg HSR Wheel Ring 18 Type Boroko',
        category: 'Kaki-Kaki',
        price: 6500000,
        originalPrice: 7200000,
        discount: 9,
        rating: 4.7,
        sold: 45,
        image: 'https://images.unsplash.com/photo-1611245594042-32a2f4c9c1b3?auto=format&fit=crop&w=600&q=80',
        badge: 'Terlaris',
        description: 'Velg racing HSR Wheel original Ring 18 PCD 5x114.3. Cocok untuk mobil Honda Civic, Toyota Innova, Honda HR-V, Mitsubishi Xpander, dan sejenisnya. Bahan paduan alumunium alloy bersertifikasi SNI dan JWL.',
        specs: {
            'Lebar Velg': '8.5 mm (Depan/Belakang)',
            'Offset (ET)': '42',
            'PCD': '5x114.3',
            'Material': 'Alumunium Alloy',
            'Warna': 'Semi Matte Black'
        },
        variants: ['Matte Black', 'Hyper Silver', 'Bronze']
    },
    {
        id: 5,
        name: 'Oli Mesin Shell Helix Ultra 5W-40 4 Liter',
        category: 'Oli & Aki',
        price: 520000,
        originalPrice: 600000,
        discount: 13,
        rating: 4.9,
        sold: 180,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        badge: '100% Original',
        description: 'Shell Helix Ultra 5W-40 merupakan pelumas mesin sintetis penuh (fully synthetic) dengan PurePlus Technology, menjaga mesin tetap bersih layaknya baru dari pabrik serta memberikan perlindungan maksimal dari keausan dan korosi.',
        specs: {
            'Viskositas': 'SAE 5W-40',
            'Volume': '4 Liter',
            'Spesifikasi API': 'API SP / SN Plus, ACEA A3/B4',
            'Jenis Mesin': 'Bensin dan Diesel'
        },
        variants: ['4 Liter']
    },
    {
        id: 6,
        name: 'Kamera Dashboard 70mai Dashcam A800S 4K HDR',
        category: 'Aksesoris',
        price: 1450000,
        originalPrice: 1750000,
        discount: 17,
        rating: 4.8,
        sold: 120,
        image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=600&q=80',
        badge: 'Flash Sale',
        description: 'Dashcam 70mai A800S menghasilkan rekaman berkualitas bioskop 4K Ultra HD dengan sensor gambar Sony IMX415. Dilengkapi built-in GPS, sistem bantuan pengemudi ADAS, pemantauan parkir 24 jam (dengan hardwire kit), dan kontrol aplikasi via Wi-Fi.',
        specs: {
            'Resolusi': '3840x2160p (4K)',
            'Sensor Kamera': 'Sony IMX415',
            'Lensa': 'Super Wide Angle 140°',
            'Layar': '3.0 inci IPS'
        },
        variants: ['Front Cam Only', 'Front + Rear Cam']
    },
    {
        id: 7,
        name: 'Ban Mobil Michelin Pilot Sport 5 - 225/45 R18',
        category: 'Kaki-Kaki',
        price: 2150000,
        originalPrice: 2400000,
        discount: 10,
        rating: 4.9,
        sold: 64,
        image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
        badge: 'Premium Grip',
        description: 'Dapatkan hasil maksimal dari pengalaman berkendara Anda dengan ban Michelin Pilot Sport 5. Dirancang untuk masa pakai yang tahan lama dan kinerja pengereman basah/kering yang luar biasa melalui teknologi Dynamic Response.',
        specs: {
            'Ukuran': '225/45 R18',
            'Indeks Beban': '95 (Maks 690 kg)',
            'Simbol Kecepatan': 'Y (Maks 300 km/jam)',
            'Tipe Kembangan': 'Asimetris'
        },
        variants: ['Ban Saja']
    },
    {
        id: 8,
        name: 'Paket Coating Ceramic Nano 3 Layer - Car Salon',
        category: 'Jasa Servis',
        price: 3499000,
        originalPrice: 4500000,
        discount: 22,
        rating: 5.0,
        sold: 38,
        image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
        badge: 'Rekomendasi',
        description: 'Paket perlindungan cat mobil premium menggunakan cairan Ceramic Nano Glass 9H sebanyak 3 layer. Menghasilkan efek daun talas (hydrophobic), mencegah jamur cat/waterspot, melindungi dari sinar UV perusak warna, dan kilau kaca super wet-look bergaransi 2 tahun.',
        specs: {
            'Durasi Pengerjaan': '2 Hari (Wajib Booking)',
            'Lapisan (Layer)': '3 Layer Nano Ceramic 9H',
            'Garansi': '2 Tahun Perawatan Rutin',
            'Lokasi': 'Workshop Putri Jaya Mobil (Bekasi)'
        },
        variants: ['City Car', 'SUV / Sedan', 'MPV / Big SUV']
    },
    {
        id: 9,
        name: 'Aki Kering Amaron Hilife Maintenance Free NS60LS',
        category: 'Oli & Aki',
        price: 980000,
        originalPrice: 1100000,
        discount: 10,
        rating: 4.8,
        sold: 95,
        image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
        badge: 'Garansi 1 Thn',
        description: 'Aki kering Amaron Hi-Life NS60LS (45Ah) teknologi kalsium perak (Silver Alloy) terbukti memiliki daya tahan yang jauh lebih lama terhadap cuaca panas ekstrim. Sangat cocok untuk mobil Avanza, Xenia, Yaris, Jazz, Civic, dan lainnya.',
        specs: {
            'Kapasitas': '12V 45Ah',
            'Tipe Aki': 'Kering (Maintenance Free)',
            'Dimensi': '238 x 129 x 227 mm',
            'Garansi Resmi': '12 Bulan'
        },
        variants: ['NS60LS', 'NS60L']
    },
    {
        id: 10,
        name: 'Lampu LED Headlight Osram LEDriving FOG H8/H11/H16',
        category: 'Kelistrikan',
        price: 850000,
        originalPrice: 990000,
        discount: 14,
        rating: 4.7,
        sold: 72,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        badge: 'Cahaya Terang',
        description: 'Lampu LED Osram menggantikan lampu halogen kabut standar dengan cahaya LED putih terang 6000K yang stylish. Menawarkan visibilitas yang jauh lebih baik tanpa menyilaukan pengendara dari arah berlawanan.',
        specs: {
            'Tipe Socket': 'H8 / H11 / H16',
            'Temperatur Warna': '6000 Kelvin (Putih)',
            'Daya Listrik': '8.2 Watt per Bohlam',
            'Umur Pakai': 'Hingga 5000 Jam'
        },
        variants: ['Putih 6000K', 'Kuning 3000K']
    }
];

export default function App() {
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
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { /* silently fail */ }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) { /* silently fail */ }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }
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
            await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' } });
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
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                    setSearchQuery(q);
                    if (q) {
                        navigateTo('home');
                    }
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
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-red-650 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold text-sm tracking-wide">Memuat produk & kategori dari database...</p>
                        </div>
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
                                        <span>- Rp {lastOrder.discount.toLocaleString('id-ID')} ({lastOrder.voucher_code})</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-1 text-sm font-extrabold text-slate-800">
                                    <span>Total Pembayaran</span>
                                    <span className="text-red-650">Rp {lastOrder.total.toLocaleString('id-ID')}</span>
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
                                    href={`https://wa.me/${settings.store_whatsapp || '6281234567890'}?text=${encodeURIComponent(
                                        `Halo ${settings.store_name || 'Putri Jaya Mobil'}, saya sudah melakukan pembayaran melalui Midtrans sebesar Rp ${lastOrder.total.toLocaleString('id-ID')} untuk pesanan saya. Mohon segera diproses.`
                                    )}`}
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
                        />
                    ) : selectedProduct ? (
                        <ProductDetailPage 
                            product={selectedProduct} 
                            onBack={() => navigateTo('home')} 
                            onAddToCart={handleAddToCart}
                            settings={settings}
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
            />

            {/* Live Chat with Customer Service */}
            <ChatWidget 
                currentUser={currentUser} 
                onOpenLogin={handleGoToLoginPage} 
            />
        </div>
    );
}
