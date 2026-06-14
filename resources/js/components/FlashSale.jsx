import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight } from 'lucide-react';

export default function FlashSale({ products = [], settings = {}, onProductClick, onSeeAll }) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false
    });

    // Countdown Timer logic based on settings end time
    useEffect(() => {
        const endTimeStr = settings.flash_sale_end_time;
        if (!endTimeStr) return;

        const updateTimer = () => {
            const normalizedStr = endTimeStr.replace(' ', 'T');
            const endTime = new Date(normalizedStr);
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setTimeLeft({ hours, minutes, seconds, isExpired: false });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [settings.flash_sale_end_time]);

    const formatNumber = (num) => String(num).padStart(2, '0');

    // Get the flash sale products dynamically from loaded products
    const flashProducts = products
        .filter(p => p.is_flash_sale)
        .slice(0, 4)
        .map(p => {
            const remaining = p.flash_sale_stock ?? 0;
            // Calculate a mock sold quantity and initial total stock dynamically
            const mockSold = (p.id % 4) + 4; 
            const totalStock = remaining + mockSold;
            const soldPercent = remaining === 0 ? 100 : (totalStock > 0 ? Math.round((mockSold / totalStock) * 100) : 0);
            return {
                ...p,
                soldPercent,
                remaining
            };
        });

    if (flashProducts.length === 0 || timeLeft.isExpired) {
        return null; // Don't render Flash Sale section if there are no products or if the time has expired
    }

    return (
        <div className="bg-white rounded-lg mt-4 shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-red-600 to-red-950 px-5 py-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 font-extrabold text-lg md:text-xl tracking-wider uppercase text-yellow-400">
                        <Flame className="fill-yellow-400 animate-bounce" size={22} />
                        <span>Flash Sale</span>
                    </div>
                    
                    {/* Countdown Timer */}
                    <div className="flex items-center space-x-1 text-xs md:text-sm font-semibold">
                        <span className="hidden sm:inline text-red-100 mr-1">Berakhir dalam:</span>
                        <span className="bg-slate-900 px-2.5 py-1 rounded text-white font-mono shadow-md">
                            {formatNumber(timeLeft.hours)}
                        </span>
                        <span className="text-yellow-400 font-bold">:</span>
                        <span className="bg-slate-900 px-2.5 py-1 rounded text-white font-mono shadow-md">
                            {formatNumber(timeLeft.minutes)}
                        </span>
                        <span className="text-yellow-400 font-bold">:</span>
                        <span className="bg-slate-900 px-2.5 py-1 rounded text-white font-mono shadow-md animate-pulse">
                            {formatNumber(timeLeft.seconds)}
                        </span>
                    </div>
                </div>

                <span 
                    onClick={onSeeAll}
                    className="flex items-center text-xs font-semibold text-yellow-300 hover:text-yellow-400 cursor-pointer transition"
                >
                    <span>Lihat Semua</span>
                    <ChevronRight size={15} />
                </span>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
                {flashProducts.map((prod) => (
                    <div
                        key={prod.id}
                        onClick={() => onProductClick(prod)}
                        className="bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl p-3 flex flex-col justify-between transition duration-300 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 cursor-pointer group"
                    >
                        {/* Image & Discount */}
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-3.5 bg-slate-100">
                            <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            {/* Discount Tag */}
                            {prod.discount > 0 && (
                                <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded shadow">
                                    -{prod.discount}%
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-red-600 transition">
                            {prod.name}
                        </h4>

                        {/* Price Area */}
                        <div className="mb-3">
                            <div className="flex items-baseline space-x-1.5">
                                <span className="text-sm md:text-base font-extrabold text-rose-600">
                                    Rp {(prod.price).toLocaleString('id-ID')}
                                </span>
                            </div>
                            {prod.discount > 0 && prod.originalPrice && (
                                <span className="text-[10px] md:text-xs text-slate-400 line-through">
                                    Rp {(prod.originalPrice).toLocaleString('id-ID')}
                                </span>
                            )}
                        </div>

                        {/* Progress Bar Stok */}
                        <div className="space-y-1">
                            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden relative flex items-center justify-center">
                                {/* Fill */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-orange-500 to-red-600 transition-all duration-1000"
                                    style={{ width: `${prod.soldPercent}%` }}
                                />
                                {/* Label overlay */}
                                <span className="relative z-10 text-[9px] font-bold text-white uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                    {prod.remaining === 0 ? 'Habis Terjual' : `Sisa ${prod.remaining} Unit`}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
