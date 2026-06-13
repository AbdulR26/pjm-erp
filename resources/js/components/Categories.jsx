import React from 'react';
import { Car, RefreshCw, Cpu, Disc, Droplets, Sparkles, Wrench, Flame } from 'lucide-react';

const CATEGORIES = [
    { name: 'Semua', label: 'Semua Produk', icon: Flame, bg: 'bg-red-50', text: 'text-red-650' },
    { name: 'Mesin', label: 'Komponen Mesin', icon: Cpu, bg: 'bg-orange-50', text: 'text-orange-600' },
    { name: 'Rem & Transmisi', label: 'Rem & Kopling', icon: Disc, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { name: 'Kaki-Kaki', label: 'Kaki & Suspensi', icon: RefreshCw, bg: 'bg-purple-50', text: 'text-purple-600' },
    { name: 'Oli & Aki', label: 'Oli, Aki & Cairan', icon: Droplets, bg: 'bg-sky-50', text: 'text-sky-600' },
    { name: 'Kelistrikan', label: 'Lampu & Listrik', icon: Car, bg: 'bg-rose-50', text: 'text-rose-600' },
    { name: 'Aksesoris', label: 'Aksesoris Mobil', icon: Sparkles, bg: 'bg-amber-50', text: 'text-amber-600' },
    { name: 'Jasa Servis', label: 'Jasa & Bengkel', icon: Wrench, bg: 'bg-cyan-50', text: 'text-cyan-600' }
];

export default function Categories({ selectedCategory, setSelectedCategory }) {
    return (
        <div className="bg-white rounded-xl p-4 md:p-5 mt-4 shadow-xs border border-slate-100">
            {/* Title (Shopee Style) */}
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    Kategori Pilihan
                </h3>
            </div>

            {/* Horizontal scroll track on mobile, Grid on desktop */}
            <div 
                className="flex md:grid md:grid-cols-8 gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scroll-smooth snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* CSS to hide webkit scrollbar */}
                <style dangerouslySetInnerHTML={{__html: `
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}} />

                {CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = selectedCategory === cat.name;

                    return (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className="flex-none w-[78px] md:w-auto snap-start flex flex-col items-center justify-center group focus:outline-hidden cursor-pointer"
                        >
                            {/* Circular Icon Box (Shopee/Tokopedia Style) */}
                            <div className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all duration-300 ${cat.bg} ${cat.text} ${
                                isSelected 
                                    ? 'ring-2 ring-red-500 ring-offset-2 scale-105 shadow-xs' 
                                    : 'hover:scale-105 border border-transparent hover:border-slate-100'
                            }`}>
                                <IconComponent className="h-5.5 w-5.5 md:h-6 md:w-6 transition-transform group-hover:scale-105" />
                            </div>

                            {/* Label */}
                            <span className={`text-[9px] md:text-xs text-center mt-2 leading-tight transition-colors duration-200 font-semibold px-1 ${
                                isSelected 
                                    ? 'text-red-600 font-bold' 
                                    : 'text-slate-650 group-hover:text-red-500'
                            }`}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}



