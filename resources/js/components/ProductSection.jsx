import React, { useState } from 'react';
import { Star, MapPin, ShoppingCart, Info, Sparkles } from 'lucide-react';

const SORT_OPTIONS = [
    { id: 'rekomendasi', label: 'Rekomendasi' },
    { id: 'terbaru', label: 'Terbaru' },
    { id: 'terlaris', label: 'Terlaris' },
    { id: 'harga-asc', label: 'Harga: Terendah' },
    { id: 'harga-desc', label: 'Harga: Tertinggi' }
];

export default function ProductSection({ 
    products, 
    searchQuery, 
    selectedCategory, 
    onProductClick, 
    onAddToCart 
}) {
    const [sortBy, setSortBy] = useState('rekomendasi');

    // Filter produk berdasarkan kategori dan pencarian
    let filteredProducts = products.filter((prod) => {
        const matchesCategory = selectedCategory === 'Semua' || prod.category === selectedCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              prod.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
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

    return (
        <div className="mt-6">
            {/* Filter & Sort Bar (Shopee Style) */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-slate-500 text-sm">
                    <span className="font-semibold text-slate-700">Urutkan:</span>
                    <div className="flex flex-wrap gap-2">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSortBy(opt.id)}
                                className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-md transition duration-200 cursor-pointer ${
                                    sortBy === opt.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter info */}
                <div className="text-xs md:text-sm text-slate-500 font-medium">
                    Menampilkan <span className="text-blue-600 font-bold">{filteredProducts.length}</span> produk 
                    {selectedCategory !== 'Semua' && <span> di kategori <span className="text-blue-600 font-bold">"{selectedCategory}"</span></span>}
                    {searchQuery && <span> untuk pencarian <span className="text-blue-600 font-bold">"{searchQuery}"</span></span>}
                </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="bg-white rounded-lg p-12 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Info size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Produk Tidak Ditemukan</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-4">
                        Maaf, produk yang Anda cari tidak tersedia. Coba ubah kata kunci atau ganti filter kategori.
                    </p>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredProducts.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group relative"
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
                                <span className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                    {prod.badge}
                                </span>
                            )}
                            
                            {/* Discount Tag */}
                            {prod.discount > 0 && (
                                <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                                    -{prod.discount}%
                                </div>
                            )}

                            {/* Hover Quick Add to Cart Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Mencegah modal terbuka
                                    onAddToCart(prod, 1);
                                }}
                                className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 hover:scale-110 z-20"
                                title="Tambah Cepat ke Keranjang"
                            >
                                <ShoppingCart size={16} className="fill-blue-900" />
                            </button>
                        </div>

                        {/* Text Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                                {/* Category */}
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                                    {prod.category}
                                </span>
                                
                                {/* Title */}
                                <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition mb-2">
                                    {prod.name}
                                </h4>
                            </div>

                            <div>
                                {/* Pricing */}
                                <div className="flex items-baseline space-x-1.5 mb-1.5">
                                    <span className="text-sm md:text-base font-extrabold text-blue-700">
                                        Rp {(prod.price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                {prod.discount > 0 && (
                                    <div className="text-[10px] md:text-xs text-slate-400 line-through -mt-1.5 mb-1.5 block">
                                        Rp {(prod.originalPrice).toLocaleString('id-ID')}
                                    </div>
                                )}

                                {/* Rating & Sold Info */}
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-50">
                                    <div className="flex items-center space-x-1 font-semibold text-slate-700">
                                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                                        <span>{prod.rating}</span>
                                    </div>
                                    <span>{prod.sold} Terjual</span>
                                </div>

                                {/* Location (Shopee style bottom tag) */}
                                <div className="flex items-center justify-end text-[9px] text-slate-400 mt-1.5">
                                    <MapPin size={10} className="mr-0.5 text-slate-300" />
                                    <span>Kota Bekasi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {filteredProducts.length > 0 && (
                <div className="flex justify-center mt-10">
                    <button className="bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 font-bold text-sm px-10 py-3.5 rounded-lg shadow-sm hover:shadow transition duration-200 cursor-pointer">
                        Lihat Lebih Banyak Produk
                    </button>
                </div>
            )}
        </div>
    );
}
