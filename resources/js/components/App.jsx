import React, { useState, useEffect } from 'react';
import Header from './Header';
import HeroCarousel from './HeroCarousel';
import Categories from './Categories';
import FlashSale from './FlashSale';
import ProductSection from './ProductSection';
import CartDrawer from './CartDrawer';
import ProductDetailModal from './ProductDetailModal';
import Footer from './Footer';

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
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

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
        alert('Terima kasih! Checkout berhasil (Simulasi). Kami akan menghubungi Anda melalui WhatsApp.');
        saveCart([]);
        setIsCartOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
            {/* Header / Navbar */}
            <Header 
                cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCart={() => setIsCartOpen(true)}
            />

            <main className="flex-grow pb-12">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    {/* Hero Banner Carousel */}
                    <HeroCarousel />

                    {/* Category Grid */}
                    <Categories 
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />

                    {/* Flash Sale Banner */}
                    <FlashSale onProductClick={setSelectedProduct} />

                    {/* Products Section with filter & search */}
                    <ProductSection 
                        products={products}
                        searchQuery={searchQuery}
                        selectedCategory={selectedCategory}
                        onProductClick={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Shopping Cart Drawer */}
            <CartDrawer 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveFromCart}
                onCheckout={handleCheckout}
            />

            {/* Product Quick View Detail Modal */}
            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(prod, qty, variant) => {
                        handleAddToCart(prod, qty, variant);
                        setSelectedProduct(null); // Tutup modal setelah tambah ke keranjang
                    }}
                />
            )}
        </div>
    );
}
