import React, { useState } from 'react';
import { Star, ShoppingCart, ShieldCheck, Heart, Share2, Plus, Minus, ArrowLeft, Truck, ShieldAlert, Award } from 'lucide-react';

export default function ProductDetailPage({ product, onBack, onAddToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || '');
    const [quantity, setQuantity] = useState(1);
    const [isWishlist, setIsWishlist] = useState(false);
    const [activeImage, setActiveImage] = useState(product.image);

    const incrementQty = () => setQuantity((prev) => prev + 1);
    const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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
                            onClick={() => setIsWishlist(!isWishlist)}
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
                                        Rp {(product.originalPrice).toLocaleString('id-ID')}
                                    </span>
                                )}
                                <span className="text-2xl md:text-3xl font-black text-red-600">
                                    Rp {(product.price).toLocaleString('id-ID')}
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
                            href={`https://wa.me/6281234567890?text=Halo%20Putri%20Jaya%20Mobil,%20saya%20tertarik%20membeli%20${encodeURIComponent(product.name)}%20(Varian:%20${encodeURIComponent(selectedVariant)},%20Jumlah:%20${quantity}).%20Bagaimana%20proses%20selanjutnya?`}
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
