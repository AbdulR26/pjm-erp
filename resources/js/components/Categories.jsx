import React from 'react';
import { Car, RefreshCw, Cpu, Disc, Droplets, Sparkles, Wrench, Flame } from 'lucide-react';

const CATEGORIES = [
    { name: 'Semua', label: 'Semua Produk', icon: Flame, color: 'bg-indigo-500' },
    { name: 'Mesin', label: 'Komponen Mesin', icon: Cpu, color: 'bg-blue-600' },
    { name: 'Rem & Transmisi', label: 'Rem & Kopling', icon: Disc, color: 'bg-emerald-600' },
    { name: 'Kaki-Kaki', label: 'Kaki & Suspensi', icon: RefreshCw, color: 'bg-purple-600' },
    { name: 'Oli & Aki', label: 'Oli, Aki & Cairan', icon: Droplets, color: 'bg-teal-600' },
    { name: 'Kelistrikan', label: 'Lampu & Listrik', icon: Car, color: 'bg-rose-500' },
    { name: 'Aksesoris', label: 'Aksesoris Mobil', icon: Sparkles, color: 'bg-amber-500' },
    { name: 'Jasa Servis', label: 'Jasa & Bengkel', icon: Wrench, color: 'bg-cyan-600' }
];

export default function Categories({ selectedCategory, setSelectedCategory }) {
    return (
        <div className="bg-white rounded-lg p-5 mt-4 shadow-sm border border-slate-100">
            {/* Title */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-sm md:text-base font-bold text-slate-800 tracking-wide uppercase">
                    Kategori Pilihan
                </h3>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
                {CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = selectedCategory === cat.name;

                    return (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className="flex flex-col items-center justify-center p-2 rounded-xl transition duration-300 group focus:outline-none cursor-pointer"
                        >
                            {/* Icon Wrapper */}
                            <div className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center text-white mb-2.5 transition-all duration-300 shadow-md ${
                                isSelected 
                                    ? `${cat.color} scale-110 ring-4 ring-offset-2 ring-blue-500/20`
                                    : 'bg-slate-50 group-hover:bg-slate-100 text-slate-600 group-hover:scale-105'
                            }`}>
                                <IconComponent className={`h-6 w-6 transition-all ${
                                    isSelected ? 'scale-110' : 'group-hover:text-blue-600'
                                }`} />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] md:text-xs font-semibold text-center leading-tight transition ${
                                isSelected ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-slate-900'
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
