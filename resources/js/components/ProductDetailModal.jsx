import React, { useState } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Heart, Share2, Plus, Minus } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || '');
    const [quantity, setQuantity] = useState(1);
    const [isWishlist, setIsWishlist] = useState(false);

    const incrementQty = () => setQuantity((prev) => prev + 1);
    const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleAddToCartClick = () => {
        onAddToCart(product, quantity, selectedVariant);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            {/* Modal Body */}
            <div className="relative w-full max-w-[900px] max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Product Image Showcase */}
                <div className="w-full md:w-[45%] p-6 bg-slate-50 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-inner bg-white mb-4">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {product.discount > 0 && (
                            <span className="absolute top-3 right-3 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow">
                                DISKON {product.discount}%
                            </span>
                        )}
                    </div>
                    
                    {/* Share / Wishlist */}
                    <div className="flex items-center space-x-6 text-slate-500 text-xs font-semibold">
                        <button 
                            onClick={() => setIsWishlist(!isWishlist)}
                            className="flex items-center space-x-1.5 hover:text-rose-500 transition cursor-pointer"
                        >
                            <Heart size={15} className={isWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                            <span>Favorit ({isWishlist ? product.sold + 1 : product.sold})</span>
                        </button>
                        <span className="text-slate-300">|</span>
                        <button className="flex items-center space-x-1.5 hover:text-blue-600 transition cursor-pointer">
                            <Share2 size={15} />
                            <span>Bagikan</span>
                        </button>
                    </div>
                </div>

                {/* Right Side: Product Info & Configuration */}
                <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-between max-h-[80vh] md:max-h-[600px] overflow-y-auto">
                    <div>
                        {/* Category Tag */}
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase mb-2.5 inline-block">
                            {product.category}
                        </span>

                        {/* Title */}
                        <h2 className="text-lg md:text-xl font-extrabold text-slate-800 leading-tight mb-2">
                            {product.name}
                        </h2>

                        {/* Star Rating & Sold */}
                        <div className="flex items-center space-x-3 mb-4 text-xs md:text-sm">
                            <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                                <span className="text-yellow-500 font-bold border-b border-yellow-500">{product.rating}</span>
                                <div className="flex text-yellow-400">
                                    <Star size={14} className="fill-current" />
                                </div>
                            </div>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500 font-medium">{product.sold} Terjual</span>
                        </div>

                        {/* Price Area */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl p-4 mb-5 border border-blue-100/50 flex flex-col justify-center">
                            <div className="flex items-baseline space-x-2.5">
                                <span className="text-xl md:text-2xl font-black text-blue-700">
                                    Rp {(product.price).toLocaleString('id-ID')}
                                </span>
                                {product.discount > 0 && (
                                    <span className="text-xs text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                        -{product.discount}%
                                    </span>
                                )}
                            </div>
                            {product.discount > 0 && (
                                <span className="text-xs text-slate-400 line-through mt-0.5">
                                    MSRP: Rp {(product.originalPrice).toLocaleString('id-ID')}
                                </span>
                            )}
                        </div>

                        {/* Short Description */}
                        <div className="mb-5">
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">Deskripsi Produk</h4>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                                {product.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        {product.specs && (
                            <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Spesifikasi Detail</h4>
                                <table className="w-full text-xs font-semibold text-slate-600">
                                    <tbody>
                                        {Object.entries(product.specs).map(([key, value]) => (
                                            <tr key={key} className="border-b border-slate-100/60 last:border-0">
                                                <td className="py-1.5 text-slate-400 w-1/3 font-medium">{key}</td>
                                                <td className="py-1.5 text-slate-800 font-medium">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Variants Select */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-5">
                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Pilih Varian</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition duration-200 cursor-pointer ${
                                                selectedVariant === v
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-6 flex items-center space-x-4">
                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Kuantitas</span>
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                <button
                                    onClick={decrementQty}
                                    className="p-2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="px-4 py-1.5 text-sm font-bold text-slate-800 w-10 text-center select-none">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQty}
                                    className="p-2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleAddToCartClick}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                            <ShoppingCart size={18} className="fill-white" />
                            <span>Tambah ke Keranjang</span>
                        </button>
                        
                        <a
                            href={`https://wa.me/6281234567890?text=Halo%20Putri%20Jaya%20Mobil,%20saya%20tertarik%20membeli%20${encodeURIComponent(product.name)}%20(Varian:%20${encodeURIComponent(selectedVariant)},%20Jumlah:%20${quantity}).%20Bagaimana%20proses%20selanjutnya?`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-emerald-500/20"
                        >
                            <span>WhatsApp</span>
                        </a>
                    </div>
                    
                    {/* Security Info */}
                    <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 mt-3.5">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        <span className="font-medium">Transaksi Aman & Bergaransi Melalui Layanan Pelanggan Kami</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
