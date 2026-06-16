import React, { useState } from 'react';
import { Star, MapPin, ShoppingCart, Info, Sparkles, Heart, Filter, X } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const SORT_OPTIONS = [
    { id: 'rekomendasi', label: 'Rekomendasi' },
    { id: 'terbaru', label: 'Terbaru' },
    { id: 'terlaris', label: 'Terlaris' },
    { id: 'harga-asc', label: 'Harga: Terendah' },
    { id: 'harga-desc', label: 'Harga: Tertinggi' }
];

const getSortLabel = (id, t) => {
    switch (id) {
        case 'rekomendasi': return t('products.recommendation');
        case 'terbaru': return t('products.newest');
        case 'terlaris': return t('products.best_seller');
        case 'harga-asc': return t('products.price_low');
        case 'harga-desc': return t('products.price_high');
        default: return id;
    }
};

export default function ProductSection({ 
    products, 
    searchQuery, 
    selectedCategory, 
    onProductClick, 
    onAddToCart,
    wishlist = [],
    onToggleWishlist
}) {
    const { t } = useLanguage();
    const [sortBy, setSortBy] = useState('rekomendasi');
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filter produk berdasarkan kategori, pencarian, harga, dan rating
    let filteredProducts = products.filter((prod) => {
        const matchesCategory = selectedCategory === 'Semua' || prod.category === selectedCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              prod.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const priceNum = Number(prod.price);
        const matchesMinPrice = appliedMinPrice === null || appliedMinPrice === '' || priceNum >= Number(appliedMinPrice);
        const matchesMaxPrice = appliedMaxPrice === null || appliedMaxPrice === '' || priceNum <= Number(appliedMaxPrice);
        
        const matchesRating = selectedRating === 0 || Number(prod.rating) >= selectedRating;

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRating;
    });

    // Urutkan produk
    if (sortBy === 'harga-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'harga-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'terlaris') {
        filteredProducts.sort((a, b) => b.sold - a.sold);
    } else if (sortBy === 'terbaru') {
        filteredProducts.sort((a, b) => b.id - a.id); // Simulasikan id lebih tinggi = terbaru
    }

    const handleApplyFilters = () => {
        setAppliedMinPrice(minPriceInput);
        setAppliedMaxPrice(maxPriceInput);
        setIsMobileFilterOpen(false);
    };

    const handleResetFilters = () => {
        setMinPriceInput('');
        setMaxPriceInput('');
        setAppliedMinPrice(null);
        setAppliedMaxPrice(null);
        setSelectedRating(0);
        setIsMobileFilterOpen(false);
    };

    const isFilterActive = appliedMinPrice !== null || appliedMaxPrice !== null || selectedRating !== 0 || minPriceInput || maxPriceInput;

    return (
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar (Desktop) */}
            <aside className="hidden lg:block w-[240px] shrink-0 space-y-6 bg-white p-5 rounded-xl border border-slate-100 shadow-xs h-fit sticky top-20">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Filter size={14} className="text-red-650" />
                        <span>{t('products.filter_title')}</span>
                    </h4>
                    {isFilterActive && (
                        <button
                            onClick={handleResetFilters}
                            className="text-[10px] text-red-600 hover:text-red-750 font-extrabold transition cursor-pointer uppercase tracking-wider bg-transparent border-0 p-0"
                        >
                            {t('products.reset_filter')}
                        </button>
                    )}
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('products.price_range')}</h5>
                    <div className="space-y-2.5">
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder={t('products.min_price')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder-slate-400"
                                value={minPriceInput}
                                onChange={(e) => setMinPriceInput(e.target.value)}
                            />
                            <span className="text-slate-400 text-xs font-bold">-</span>
                            <input
                                type="number"
                                placeholder={t('products.max_price')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder-slate-400"
                                value={maxPriceInput}
                                onChange={(e) => setMaxPriceInput(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleApplyFilters}
                            className="w-full bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs py-2.5 rounded-lg transition duration-200 cursor-pointer uppercase tracking-wider shadow-xs"
                        >
                            {t('products.apply_filter')}
                        </button>
                    </div>
                </div>

                {/* Ratings */}
                <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('products.rating_filter')}</h5>
                    <div className="space-y-1.5">
                        <button
                            onClick={() => setSelectedRating(0)}
                            className={`w-full flex items-center space-x-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                selectedRating === 0 
                                    ? 'bg-red-50 text-red-600 font-bold' 
                                    : 'text-slate-650 hover:bg-slate-50'
                            }`}
                        >
                            <span>Semua Rating</span>
                        </button>
                        {[5, 4, 3, 2].map((stars) => (
                            <button
                                key={stars}
                                onClick={() => setSelectedRating(stars)}
                                className={`w-full flex items-center space-x-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                    selectedRating === stars 
                                        ? 'bg-red-50 text-red-600 font-bold' 
                                        : 'text-slate-650 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < stars ? 'fill-yellow-400' : 'text-slate-200'}
                                        />
                                    ))}
                                </div>
                                {stars < 5 && <span>{t('products.stars_up')}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Product Grid Area */}
            <div className="grow">
                {/* Filter & Sort Bar (Shopee Style) */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="flex items-center space-x-2 text-slate-500 text-sm">
                            <span className="font-semibold text-slate-700">{t('products.sort_by')}</span>
                            <div className="flex flex-wrap gap-2">
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSortBy(opt.id)}
                                        className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-md transition duration-200 cursor-pointer ${
                                            sortBy === opt.id
                                                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                                                : 'bg-slate-100 text-slate-655 hover:bg-slate-200'
                                        }`}
                                    >
                                        {getSortLabel(opt.id, t)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Filter Trigger Button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-1.5 bg-slate-100 hover:bg-slate-250 text-slate-700 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold cursor-pointer transition border border-slate-200/50"
                        >
                            <Filter size={13} className="text-red-600" />
                            <span>{t('products.filter_title')}</span>
                            {(appliedMinPrice !== null || appliedMaxPrice !== null || selectedRating !== 0) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            )}
                        </button>
                    </div>

                    {/* Filter info */}
                    <div className="text-xs md:text-sm text-slate-500 font-medium">
                        {t('products.showing', { count: filteredProducts.length })}
                        {selectedCategory !== 'Semua' && <span>{t('products.in_category', { category: selectedCategory })}</span>}
                        {searchQuery && <span>{t('products.for_search', { query: searchQuery })}</span>}
                    </div>
                </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="bg-white rounded-lg p-12 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <Info size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{t('products.not_found')}</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-4">
                        {t('products.not_found_desc')}
                    </p>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredProducts.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 transition duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group relative"
                        onClick={() => onProductClick(prod)}
                    >
                        {/* Image area */}
                        <div className="relative aspect-square overflow-hidden bg-slate-50">
                            <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            {/* Top left badge */}
                            {prod.badge && (
                                <span className="absolute top-2 left-2 bg-linear-to-r from-red-600 to-red-950 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                    {prod.badge}
                                </span>
                            )}
                            
                            {/* Discount Tag */}
                            {prod.discount > 0 && (
                                <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                                    -{prod.discount}%
                                </div>
                            )}

                            {/* Favorite Heart Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleWishlist(prod);
                                }}
                                className={`absolute ${prod.discount > 0 ? 'top-11' : 'top-2'} right-2 bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 p-2 rounded-full shadow-md transition duration-300 hover:scale-110 z-20 flex items-center justify-center`}
                                title={t('products.add_to_wishlist', { defaultValue: 'Tambah ke Favorit' })}
                            >
                                <Heart size={14} className={wishlist.some(item => item.id === prod.id) ? 'fill-rose-500 text-rose-500' : ''} />
                            </button>

                            {/* Hover Quick Add to Cart Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Mencegah modal terbuka
                                    onAddToCart(prod, 1);
                                }}
                                className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-500 text-red-950 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 hover:scale-110 z-20"
                                title={t('products.quick_add')}
                            >
                                <ShoppingCart size={16} className="fill-red-950" />
                            </button>
                        </div>

                        {/* Text Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                                {/* Category */}
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">
                                    {prod.category}
                                </span>
                                
                                {/* Title */}
                                <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-red-600 transition mb-2">
                                    {prod.name}
                                </h4>
                            </div>

                            <div>
                                {/* Pricing */}
                                <div className="flex items-baseline space-x-1.5 mb-1.5">
                                    <span className="text-sm md:text-base font-extrabold text-red-600">
                                        {formatRupiah(prod.price)}
                                    </span>
                                </div>
                                {prod.discount > 0 && (
                                    <div className="text-[10px] md:text-xs text-slate-400 line-through -mt-1.5 mb-1.5 block">
                                        {formatRupiah(prod.originalPrice)}
                                    </div>
                                )}

                                {/* Rating & Sold Info */}
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-50">
                                    <div className="flex items-center space-x-1 font-semibold text-slate-700">
                                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                                        <span>{prod.rating}</span>
                                    </div>
                                    <span>{t('products.sold', { count: prod.sold })}</span>
                                </div>

                                {/* Location (Shopee style bottom tag) */}
                                <div className="flex items-center justify-end text-[9px] text-slate-400 mt-1.5">
                                    <MapPin size={10} className="mr-0.5 text-slate-300" />
                                    <span>{t('products.location')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {filteredProducts.length > 0 && (
                <div className="flex justify-center mt-10">
                    <button className="bg-white hover:bg-slate-50 text-red-600 border border-red-200 font-bold text-sm px-10 py-3.5 rounded-lg shadow-sm hover:shadow transition duration-200 cursor-pointer">
                        {t('products.load_more')}
                    </button>
                </div>
            )}
            </div>

            {/* Mobile Filter Modal Bottom Sheet */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex items-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/55 animate-in fade-in duration-200"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                    {/* Panel */}
                    <div className="relative w-full bg-white rounded-t-2xl shadow-2xl p-5 space-y-6 z-10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Filter size={14} className="text-red-600" />
                                <span>{t('products.filter_title')}</span>
                            </h4>
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('products.price_range')}</h5>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    placeholder={t('products.min_price')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder-slate-400"
                                    value={minPriceInput}
                                    onChange={(e) => setMinPriceInput(e.target.value)}
                                />
                                <span className="text-slate-400 text-xs font-bold">-</span>
                                <input
                                    type="number"
                                    placeholder={t('products.max_price')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder-slate-400"
                                    value={maxPriceInput}
                                    onChange={(e) => setMaxPriceInput(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Ratings */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('products.rating_filter')}</h5>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => setSelectedRating(0)}
                                    className={`w-full flex items-center space-x-2 py-2.5 px-3.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                        selectedRating === 0 
                                            ? 'bg-rose-50 text-red-600 font-bold' 
                                            : 'text-slate-655 hover:bg-slate-50'
                                    }`}
                                >
                                    <span>Semua Rating</span>
                                </button>
                                {[5, 4, 3, 2].map((stars) => (
                                    <button
                                        key={stars}
                                        onClick={() => setSelectedRating(stars)}
                                        className={`w-full flex items-center space-x-2 py-2.5 px-3.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                                            selectedRating === stars 
                                                ? 'bg-rose-50 text-red-600 font-bold' 
                                                : 'text-slate-650 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < stars ? 'fill-yellow-400' : 'text-slate-200'}
                                                />
                                            ))}
                                        </div>
                                        {stars < 5 && <span>{t('products.stars_up')}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-3 border-t border-slate-100">
                            <button
                                onClick={handleResetFilters}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3.5 rounded-lg transition duration-200 cursor-pointer uppercase tracking-wider"
                            >
                                {t('products.reset_filter')}
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs py-3.5 rounded-lg transition duration-200 cursor-pointer uppercase tracking-wider shadow-md hover:shadow-red-500/20"
                            >
                                {t('products.apply_filter')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
