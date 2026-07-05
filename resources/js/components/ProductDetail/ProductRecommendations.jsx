import React from 'react';
import { Star, MapPin, Heart, ShoppingCart } from 'lucide-react';
import { formatRupiah } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductRecommendations({
    currentProduct,
    products = [],
    onProductClick,
    onAddToCart,
    wishlist = [],
    onToggleWishlist,
    settings = {}
}) {
    const { t } = useLanguage();

    // Dapatkan rekomendasi produk dari kategori yang sama, hilangkan produk yang sedang aktif
    let recommendations = products.filter(
        (prod) => prod.id !== currentProduct.id && prod.category === currentProduct.category
    );

    // Jika rekomendasi kategori yang sama kurang dari 5, tambahkan produk acak lainnya
    if (recommendations.length < 5) {
        const fallbackProducts = products.filter(
            (prod) => prod.id !== currentProduct.id && prod.category !== currentProduct.category
        );
        recommendations = [...recommendations, ...fallbackProducts].slice(0, 8);
    } else {
        recommendations = recommendations.slice(0, 8);
    }

    if (recommendations.length === 0) return null;

    return (
        <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-slate-100 mt-6">
            <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-5 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Rekomendasi Produk</span>
                <span className="text-[10px] font-bold text-slate-400 normal-case font-mono hidden sm:inline">Geser untuk melihat lainnya →</span>
            </h3>

            {/* Horizontal Scroll Wrapper */}
            <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent snap-x">
                {recommendations.map((prod) => {
                    const isFav = wishlist.some(item => parseInt(item.id) === parseInt(prod.id));
                    return (
                        <div
                            key={prod.id}
                            className="w-[170px] md:w-[200px] shrink-0 bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group relative snap-start"
                            onClick={() => {
                                onProductClick(prod);
                                // Scroll page to top when click recommendation
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            {/* Image area */}
                            <div className="relative aspect-square overflow-hidden bg-slate-50">
                                <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    loading="lazy"
                                />
                                {/* Top left badge */}
                                {prod.badge && (
                                    <span className="absolute top-2 left-2 bg-linear-to-r from-red-650 to-red-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                        {prod.badge}
                                    </span>
                                )}

                                {/* Discount Tag */}
                                {prod.discount > 0 && (
                                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                        -{prod.discount}%
                                    </div>
                                )}

                                {/* Favorite Heart Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleWishlist(prod);
                                    }}
                                    className={`absolute ${prod.discount > 0 ? 'top-10' : 'top-2'} right-2 bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 p-1.5 rounded-full shadow-xs transition duration-300 hover:scale-110 z-20 flex items-center justify-center`}
                                >
                                    <Heart size={12} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
                                </button>

                                {/* Hover Quick Add to Cart Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(prod, 1);
                                    }}
                                    className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-500 text-red-950 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition duration-300 hover:scale-110 z-20"
                                    title={t('products.quick_add')}
                                >
                                    <ShoppingCart size={13} className="fill-red-950" />
                                </button>
                            </div>

                            {/* Text Details */}
                            <div className="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                    {/* Category */}
                                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest block mb-1">
                                        {prod.category}
                                    </span>

                                    {/* Title */}
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-red-600 transition mb-2 min-h-8">
                                        {prod.name}
                                    </h4>
                                </div>

                                <div>
                                    {/* Pricing */}
                                    <div className="flex items-baseline space-x-1 mb-1">
                                        <span className="text-xs md:text-sm font-extrabold text-red-600">
                                            {formatRupiah(prod.price)}
                                        </span>
                                    </div>
                                    {prod.discount > 0 && (
                                        <div className="text-[9px] text-slate-400 line-through -mt-1 mb-1 block">
                                            {formatRupiah(prod.originalPrice)}
                                        </div>
                                    )}

                                    {/* Rating & Sold Info */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-50">
                                        <div className="flex items-center space-x-0.5 font-semibold text-slate-700">
                                            <Star className="text-yellow-400 fill-yellow-400" size={10} />
                                            <span>{prod.rating}</span>
                                        </div>
                                        <span>{t('products.sold', { count: prod.sold })}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center justify-end text-[8px] text-slate-400 mt-1">
                                        <MapPin size={8} className="mr-0.5 text-slate-350" />
                                        <span>{settings.store_city || 'Kota Bekasi'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
