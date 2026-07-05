import React from 'react';
import { Car, RefreshCw, Cpu, Disc, Droplets, Sparkles, Wrench, Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const getCategoryStyle = (name) => {
    const n = name.toLowerCase();
    if (n.includes('oli') || n.includes('pelumas') || n.includes('aki') || n.includes('cairan')) {
        return { icon: Droplets, bg: 'bg-sky-50', text: 'text-sky-600' };
    }
    if (n.includes('rem') || n.includes('pengereman')) {
        return { icon: Disc, bg: 'bg-emerald-50', text: 'text-emerald-600' };
    }
    if (n.includes('kaki') || n.includes('ban') || n.includes('suspensi') || n.includes('shock')) {
        return { icon: RefreshCw, bg: 'bg-purple-50', text: 'text-purple-600' };
    }
    if (n.includes('mesin') || n.includes('transmisi') || n.includes('busi') || n.includes('filter')) {
        return { icon: Cpu, bg: 'bg-orange-50', text: 'text-orange-600' };
    }
    if (n.includes('aksesoris') || n.includes('variasi') || n.includes('cover') || n.includes('karpet') || n.includes('parfum')) {
        return { icon: Sparkles, bg: 'bg-amber-50', text: 'text-amber-600' };
    }
    if (n.includes('listrik') || n.includes('lampu') || n.includes('led')) {
        return { icon: Car, bg: 'bg-rose-50', text: 'text-rose-600' };
    }
    // Default
    return { icon: Wrench, bg: 'bg-cyan-50', text: 'text-cyan-600' };
};

export default function Categories({ categories = [], selectedCategory, setSelectedCategory }) {
    const { t } = useLanguage();
    // Get unique category names that are either root categories (parent_id is null) or have active products
    const uniqueCategoryNames = Array.from(
        new Set(
            categories
                .filter(c => c.parent_id === null || c.products_count > 0)
                .map(c => c.name)
        )
    ).slice(0, 7); // Show max 7 main categories + 'Semua' for cleaner UI layout

    const displayCategories = [
        { name: 'Semua', label: t('categories.all_products'), icon: Flame, bg: 'bg-red-50', text: 'text-red-650' },
        ...uniqueCategoryNames.map(name => {
            const style = getCategoryStyle(name);
            return {
                name: name,
                label: name,
                icon: style.icon,
                bg: style.bg,
                text: style.text
            };
        })
    ];

    return (
        <div className="bg-white rounded-xl p-4 md:p-5 mt-4 shadow-xs border border-slate-100">
            {/* Title (Shopee Style) */}
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    {t('categories.title')}
                </h3>
            </div>

            {/* Responsive Grid layout for mobile (4 cols) and desktop (8 cols) */}
            <div 
                className="grid grid-cols-4 md:grid-cols-8 gap-y-4 gap-x-2 md:gap-4"
            >
                {displayCategories.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = selectedCategory === cat.name;

                    return (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className="w-full flex flex-col items-center justify-start group focus:outline-hidden cursor-pointer"
                        >
                            {/* Circular Icon Box (Shopee/Tokopedia Style) */}
                            <div className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all duration-300 ${cat.bg} ${cat.text} ${
                                isSelected 
                                    ? 'ring-2 ring-red-500 ring-offset-2 scale-105 shadow-xs' 
                                    : 'hover:scale-105 border border-transparent hover:border-slate-100'
                            }`}>
                                <IconComponent className="h-5.5 w-5.5 md:h-6 md:w-6 transition-transform group-hover:scale-105" />
                            </div>

                            {/* Label Wrapper with Fixed Height for Uniform Alignment */}
                            <div className="w-full h-8 mt-2 flex items-start justify-center overflow-hidden">
                                <span className={`text-[10px] md:text-xs text-center leading-tight transition-colors duration-200 font-semibold px-0.5 line-clamp-2 ${
                                    isSelected 
                                        ? 'text-red-650 font-bold' 
                                        : 'text-slate-655 group-hover:text-red-500'
                                }`}>
                                    {cat.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
