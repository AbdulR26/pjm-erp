import React, { useState } from 'react';
import { Star, ShoppingCart, ShieldCheck, Heart, Share2, Plus, Minus, ArrowLeft, Truck, ShieldAlert, Award } from 'lucide-react';
import { formatRupiah, getStoreName, getWhatsAppLink } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

export default function ProductDetailPage({ product, onBack, onAddToCart, wishlist = [], onToggleWishlist, settings = {} }) {
    const storeName = getStoreName(settings);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || '');
    const [quantity, setQuantity] = useState(1);
    const isWishlist = wishlist.some((item) => item.id === product.id);
    const [activeImage, setActiveImage] = useState(product.image);

    const incrementQty = () => setQuantity((prev) => prev + 1);
    const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const { t } = useLanguage();
    const [postalCodeInput, setPostalCodeInput] = useState('');
    const [shippingRates, setShippingRates] = useState([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState('');
    const [showPopularCities, setShowPopularCities] = useState(false);

    const POPULAR_CITIES = [
        { name: 'Jakarta Pusat', postal: '10110' },
        { name: 'Jakarta Selatan', postal: '12110' },
        { name: 'Surabaya', postal: '60111' },
        { name: 'Bandung', postal: '40111' },
        { name: 'Bekasi', postal: '17110' },
        { name: 'Tangerang', postal: '15110' },
        { name: 'Sidoarjo', postal: '61211' },
        { name: 'Medan', postal: '20111' },
        { name: 'Makassar', postal: '90111' }
    ];

    const handleCheckShipping = async (postalCode) => {
        const targetPostal = postalCode || postalCodeInput;
        if (!targetPostal || targetPostal.trim().length < 3) {
            setRatesError('Masukkan Kota / Kode Pos yang valid');
            return;
        }
        setLoadingRates(true);
        setRatesError('');
        setShippingRates([]);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/api/shipment/rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    postal_code: targetPostal.trim(),
                    items: [
                        {
                            product_id: product.id,
                            variant_name: selectedVariant || '',
                            quantity: quantity
                        }
                    ]
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || t('products.shipping_empty_rates'));
            }

            const rawRates = data.rates || [];
            setShippingRates(rawRates);
            if (rawRates.length === 0) {
                setRatesError(t('products.shipping_empty_rates'));
            }
        } catch (err) {
            console.error(err);
            setRatesError(err.message || 'Gagal memuat ongkir. Silakan periksa koneksi atau kode pos Anda.');
        } finally {
            setLoadingRates(false);
        }
    };

    const handleAddToCartClick = () => {
        onAddToCart(product, quantity, selectedVariant);
    };

    // Gallery images simulation (using fallback unsplash pictures for nice details)
    const galleryImages = [
        product.image,
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=150&q=80'
    ];

    return (
        <div className="space-y-4 py-4 animate-in fade-in duration-300">
            {/* Breadcrumb & Back Button */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={onBack}
                        className="flex items-center space-x-1 hover:text-red-650 transition cursor-pointer text-slate-800 font-bold"
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali ke Toko</span>
                    </button>
                    <span>/</span>
                    <span>{product.category}</span>
                    <span>/</span>
                    <span className="text-slate-400 truncate max-w-[200px] md:max-w-none">{product.name}</span>
                </div>
            </div>

            {/* Main Product Showcase Card */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Left Column: Image Gallery & Sharing */}
                <div className="w-full md:w-[42%] shrink-0">
                    {/* Big Showcase Image */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-inner flex items-center justify-center">
                        <img 
                            src={activeImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        {product.discount > 0 && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow">
                                DISKON {product.discount}%
                            </div>
                        )}
                    </div>

                    {/* Small Thumbnails (Gallery) */}
                    <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                        {galleryImages.map((imgUrl, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(imgUrl)}
                                className={`h-16 w-16 md:h-18 md:w-18 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                    activeImage === imgUrl ? 'border-red-600 shadow-sm' : 'border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                <img src={imgUrl} alt="gallery" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Share & Wishlist Row */}
                    <div className="flex items-center justify-between border-t border-slate-100 mt-6 pt-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center space-x-3">
                            <span>Bagikan:</span>
                            <button className="text-blue-600 hover:scale-110 transition cursor-pointer font-bold">Facebook</button>
                            <button className="text-sky-500 hover:scale-110 transition cursor-pointer font-bold">Twitter</button>
                            <button className="text-emerald-500 hover:scale-110 transition cursor-pointer font-bold">WhatsApp</button>
                        </div>
                        <span className="text-slate-200">|</span>
                        <button 
                            onClick={() => onToggleWishlist(product)}
                            className="flex items-center space-x-1.5 text-slate-650 hover:text-rose-500 transition cursor-pointer"
                        >
                            <Heart size={16} className={isWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                            <span>Favorit ({isWishlist ? product.sold + 1 : product.sold})</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Detailed Product Configurator */}
                <div className="grow flex flex-col justify-between">
                    <div>
                        {/* Title & Brand */}
                        <div className="space-y-2">
                            <span className="bg-red-50 text-red-600 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md uppercase inline-block">
                                {product.category}
                            </span>
                            <h1 className="text-lg md:text-2xl font-black text-slate-800 leading-snug">
                                {product.name}
                            </h1>
                        </div>

                        {/* Rating, Reviews, Sold Row (Shopee Style) */}
                        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500 mt-3 pb-4 border-b border-slate-100">
                            <div className="flex items-center space-x-1 text-red-600 font-extrabold">
                                <span className="border-b-2 border-red-600 pr-1">{product.rating}</span>
                                <div className="flex text-yellow-400">
                                    <Star size={14} className="fill-current" />
                                    <Star size={14} className="fill-current" />
                                    <Star size={14} className="fill-current" />
                                    <Star size={14} className="fill-current" />
                                    <Star size={14} className="fill-current" />
                                </div>
                            </div>
                            <span className="text-slate-200">|</span>
                            <div className="flex items-center space-x-1 text-slate-800 font-bold">
                                <span className="border-b-2 border-slate-800">12</span>
                                <span className="text-slate-500 font-medium">Penilaian</span>
                            </div>
                            <span className="text-slate-200">|</span>
                            <div className="text-slate-800 font-bold">
                                <span>{product.sold}</span>
                                <span className="text-slate-500 font-medium"> Terjual</span>
                            </div>
                        </div>

                        {/* Price Area (Shopee Banner Style) */}
                        <div className="bg-linear-to-r from-red-50 to-rose-50/50 rounded-xl p-5 my-5 border border-red-100/30">
                            <div className="flex items-center gap-3">
                                {product.discount > 0 && (
                                    <span className="text-sm text-slate-400 line-through">
                                        {formatRupiah(product.originalPrice)}
                                    </span>
                                )}
                                <span className="text-2xl md:text-3xl font-black text-red-600">
                                    {formatRupiah(product.price)}
                                </span>
                                {product.discount > 0 && (
                                    <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                                        {product.discount}% DISKON
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2.5 text-[10px] text-red-600 font-bold mt-2">
                                <span className="border border-red-650 px-1.5 py-0.5 rounded uppercase">Garansi PJM</span>
                                <span>100% Produk Asli & Orisinil Pabrik</span>
                            </div>
                        </div>

                        {/* Shipping details (Shopee style) */}
                        <div className="space-y-3.5 text-xs md:text-sm text-slate-500 pb-5 border-b border-slate-100">
                            <div className="flex">
                                <span className="w-24 md:w-32 shrink-0 font-bold text-slate-400">Pengiriman</span>
                                <div className="space-y-1.5 font-medium text-slate-700 grow">
                                    <div className="flex items-center space-x-2">
                                        <Truck size={16} className="text-slate-500" />
                                        <span>Pengiriman dari: <strong>Surabaya</strong></span>
                                    </div>
                                    <div className="text-slate-500 text-xs">Ongkos kirim mulai dari Rp 10.000 (Melalui ekspedisi partner/kurir toko)</div>
                                    
                                    {/* Biteship Instant Rate Checker Widget */}
                                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2.5 max-w-md">
                                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                            {t('products.check_shipping')}
                                        </div>
                                        <div className="flex gap-2 relative">
                                            <div className="relative grow">
                                                <input
                                                    type="text"
                                                    placeholder={t('products.shipping_dest')}
                                                    value={postalCodeInput}
                                                    onChange={(e) => {
                                                        setPostalCodeInput(e.target.value);
                                                        setShowPopularCities(true);
                                                    }}
                                                    onFocus={() => setShowPopularCities(true)}
                                                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder-slate-400"
                                                />
                                                {showPopularCities && (
                                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-40 text-xs font-semibold py-1">
                                                        <div className="px-2.5 py-1 text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">Kota Populer</div>
                                                        {POPULAR_CITIES.filter(c => 
                                                            c.name.toLowerCase().includes(postalCodeInput.toLowerCase()) || 
                                                            c.postal.includes(postalCodeInput)
                                                        ).map(city => (
                                                            <button
                                                                key={city.postal}
                                                                type="button"
                                                                onClick={() => {
                                                                    setPostalCodeInput(`${city.name} (${city.postal})`);
                                                                    setShowPopularCities(false);
                                                                    handleCheckShipping(city.postal);
                                                                }}
                                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition"
                                                            >
                                                                {city.name} - {city.postal}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPopularCities(false);
                                                    const match = postalCodeInput.match(/\((\d{5})\)/);
                                                    const code = match ? match[1] : postalCodeInput;
                                                    handleCheckShipping(code);
                                                }}
                                                disabled={loadingRates}
                                                className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs px-4 py-1.5 rounded-md transition duration-200 cursor-pointer shadow-xs disabled:opacity-60"
                                            >
                                                {t('products.check_rates_btn')}
                                            </button>
                                        </div>

                                        {/* Backdrop to close popular cities dropdown */}
                                        {showPopularCities && (
                                            <div 
                                                className="fixed inset-0 z-30" 
                                                onClick={() => setShowPopularCities(false)}
                                            />
                                        )}

                                        {/* Loading State */}
                                        {loadingRates && (
                                            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium animate-pulse">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce"></span>
                                                <span>{t('products.shipping_loading')}</span>
                                            </div>
                                        )}

                                        {/* Error State */}
                                        {ratesError && (
                                            <div className="text-[11px] text-red-600 font-semibold">
                                                ⚠️ {ratesError}
                                            </div>
                                        )}

                                        {/* Rates Results */}
                                        {shippingRates.length > 0 && (
                                            <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                                                {shippingRates.map((rate, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-2 rounded-md hover:border-red-200 transition duration-200">
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs font-bold text-slate-800">
                                                                {rate.courier_name} <span className="text-[9px] text-red-650 font-bold uppercase">{rate.courier_service_name}</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 font-medium">
                                                                Estimasi: {rate.duration} {rate.duration.toLowerCase().includes('hari') ? '' : 'hari'}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-extrabold text-red-600">
                                                            {formatRupiah(rate.price)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variants Select */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="flex py-5 border-b border-slate-100 text-xs md:text-sm">
                                <span className="w-24 md:w-32 shrink-0 font-bold text-slate-400 self-center">Pilihan Varian</span>
                                <div className="flex flex-wrap gap-2 grow">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg border transition duration-200 cursor-pointer ${
                                                selectedVariant === v
                                                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-350'
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex py-5 border-b border-slate-100 text-xs md:text-sm">
                            <span className="w-24 md:w-32 shrink-0 font-bold text-slate-400 self-center">Jumlah</span>
                            <div className="flex items-center grow space-x-4">
                                <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                                    <button
                                        onClick={decrementQty}
                                        className="p-1.5 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-3.5 py-1 text-sm font-bold text-slate-800 w-10 text-center select-none">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={incrementQty}
                                        className="p-1.5 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <span className="text-slate-400 text-xs font-semibold">Tersedia lebih dari 50 barang</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (Shopee Style) */}
                    <div className="flex flex-wrap items-center gap-3.5 mt-6 pt-2">
                        {/* Add to Cart - Shopee Ghost Red Button */}
                        <button
                            onClick={handleAddToCartClick}
                            className="flex-1 min-w-[200px] bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-500 font-extrabold py-3.5 px-4 rounded-lg shadow-xs transition duration-300 flex items-center justify-center space-x-2.5 cursor-pointer"
                        >
                            <ShoppingCart size={18} className="fill-red-600" />
                            <span>Masukkan Keranjang</span>
                        </button>
                        
                        {/* Buy Now / WA Link - Shopee Solid Red Button */}
                        <a
                            href={getWhatsAppLink(
                                settings,
                                `Halo ${storeName}, saya tertarik membeli ${product.name} (Varian: ${selectedVariant}, Jumlah: ${quantity}). Bagaimana proses selanjutnya?`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[150px] bg-linear-to-r from-red-600 to-red-900 hover:from-red-700 hover:to-red-950 text-white font-extrabold py-3.5 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-red-500/20"
                        >
                            <span>Beli Sekarang via WA</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Specifications & Description Grid */}
            <div className="grid grid-cols-1 gap-4 mt-6">
                {/* Specifications Card */}
                {product.specs && (
                    <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-slate-100">
                        <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-3">
                            Spesifikasi Produk
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs md:text-sm">
                            {Object.entries(product.specs).map(([key, value]) => (
                                <div key={key} className="flex border-b border-slate-100/50 pb-2 last:border-0 last:pb-0">
                                    <span className="w-32 md:w-40 shrink-0 font-bold text-slate-400">{key}</span>
                                    <span className="text-slate-800 font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description Card */}
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-slate-100">
                    <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-3">
                        Deskripsi Produk
                    </h3>
                    <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-medium whitespace-pre-line">
                        {product.description}
                    </p>
                </div>

                {/* Simulated Customer Reviews (Shopee Style) */}
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-slate-100">
                    <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-3">
                        Penilaian Produk (12)
                    </h3>
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-4">
                            <div className="flex items-center space-x-2 text-xs mb-1.5">
                                <span className="font-extrabold text-slate-800">budi_prasetyo</span>
                                <div className="flex text-yellow-400">
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">Barang sangat bagus, orisinil, seller ramah banget bantu nyariin kecocokan part numbernya. Recommended seller!</p>
                            <span className="text-[10px] text-slate-400 block mt-1">Varian: {selectedVariant || 'Default'} | 2026-06-12 14:22</span>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 text-xs mb-1.5">
                                <span className="font-extrabold text-slate-800">andri_auto</span>
                                <div className="flex text-yellow-400">
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                    <Star size={11} className="fill-current" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">Pengiriman cepet banget ke Sidoarjo. Pas dicoba langsung PNP di mobil saya. Kualitas jempolan!</p>
                            <span className="text-[10px] text-slate-400 block mt-1">Varian: {selectedVariant || 'Default'} | 2026-06-10 09:15</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
