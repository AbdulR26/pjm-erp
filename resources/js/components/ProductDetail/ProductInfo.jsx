import React from 'react';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { formatRupiah } from '../../utils/helpers';
import ShippingChecker from './ShippingChecker';

export default function ProductInfo({
    product,
    selectedVariant,
    setSelectedVariant,
    displayPrice,
    displayOriginalPrice,
    displayDiscount,
    displayStock,
    quantity,
    incrementQty,
    decrementQty,
    onAddToCart,
    onBuyNow,
    settings
}) {
    return (
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
                <div className="flex items-center gap-4 text-xs mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                    <div className="flex items-center space-x-1 font-extrabold text-amber-500">
                        <span>{product.rating}</span>
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    className={i < Math.round(product.rating) ? "fill-current" : "text-slate-200 fill-transparent"}
                                />
                            ))}
                        </div>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="text-slate-600 font-semibold">
                        <span className="text-slate-800 font-bold">{product.reviews ? product.reviews.length : 0}</span> Penilaian
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="text-slate-600 font-semibold">
                        <span className="text-slate-800 font-bold">{product.sold}</span>
                        <span className="text-slate-500 font-medium"> Terjual</span>
                    </div>
                </div>

                {/* Price Area */}
                <div className="bg-linear-to-r from-red-50 to-rose-50/50 rounded-xl p-5 my-5 border border-red-100/30">
                    <div className="flex items-center gap-3">
                        {displayDiscount > 0 && (
                            <span className="text-sm text-slate-400 line-through">
                                {formatRupiah(displayOriginalPrice)}
                            </span>
                        )}
                        <span className="text-2xl md:text-3xl font-black text-red-600">
                            {formatRupiah(displayPrice)}
                        </span>
                        {displayDiscount > 0 && (
                            <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                                {displayDiscount}% DISKON
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2.5 text-[10px] text-red-650 font-bold mt-2">
                        <span className="border border-red-650 px-1.5 py-0.5 rounded uppercase">Garansi PJM</span>
                        <span>100% Produk Asli & Orisinil Pabrik</span>
                    </div>
                </div>

                {/* Shipping Checker */}
                <ShippingChecker
                    product={product}
                    selectedVariant={selectedVariant ? selectedVariant.name : ''}
                    quantity={quantity}
                    settings={settings}
                />

                {/* Variants Picker */}
                {product.variants && product.variants.length > 0 && (
                    <div className="flex py-5 border-b border-slate-100 text-xs md:text-sm">
                        <span className="w-24 md:w-32 shrink-0 font-bold text-slate-400 self-center">Pilihan Varian</span>
                        <div className="flex flex-wrap gap-2 grow">
                            {product.variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`flex items-center space-x-2.5 pl-1.5 pr-4 py-1.5 text-xs font-bold rounded-md border transition duration-200 cursor-pointer ${
                                        selectedVariant?.id === v.id
                                            ? 'border-red-600 text-red-600 ring-1 ring-red-600 bg-red-50/20'
                                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-350'
                                    }`}
                                >
                                    <img
                                        src={v.image || '/images/default-product.png'}
                                        alt={v.name}
                                        className="w-8 h-8 object-cover rounded-sm border border-slate-100"
                                    />
                                    <span>{v.name}</span>
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
                        <span className="text-slate-400 text-xs font-semibold">
                            {displayStock !== undefined && displayStock !== null && displayStock > 0
                                ? `Stok: ${displayStock} pcs`
                                : displayStock === 0 ? 'Stok Habis' : 'Stok Tersedia'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons (Shopee Style: Add To Cart outline, Buy Now solid red) */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-6 pt-2 w-full">
                <button
                    onClick={() => onAddToCart(product, quantity, selectedVariant ? selectedVariant.name : '')}
                    className="flex-1 w-full bg-[#c0001a]/10 hover:bg-[#c0001a]/15 text-[#c0001a] border border-[#c0001a] font-extrabold py-3 rounded-lg transition duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                    <ShoppingCart size={16} className="text-[#c0001a]" />
                    <span>Masukkan Keranjang</span>
                </button>
                
                <button
                    onClick={() => onBuyNow(product, quantity, selectedVariant ? selectedVariant.name : '')}
                    className="flex-1 w-full bg-linear-to-r from-red-650 to-red-800 hover:from-red-700 hover:to-red-950 text-white font-extrabold py-3.5 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2.5 cursor-pointer shadow-md hover:shadow-red-500/25"
                >
                    <span>Beli Sekarang</span>
                </button>
            </div>
        </div>
    );
}
