import React, { useState, useEffect } from 'react';
import { Flame, ArrowLeft, ShoppingCart, Info } from 'lucide-react';

export default function FlashSalePage({ products = [], settings = {}, onBack, onProductClick, onAddToCart }) {
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

    // Get all flash sale products dynamically from loaded products
    const flashProducts = products
        .filter(p => p.is_flash_sale)
        .map(p => {
            const remaining = p.flash_sale_stock ?? 0;
            const mockSold = (p.id % 4) + 4; 
            const totalStock = remaining + mockSold;
            const soldPercent = remaining === 0 ? 100 : (totalStock > 0 ? Math.round((mockSold / totalStock) * 100) : 0);
            return {
                ...p,
                soldPercent,
                remaining
            };
        });

    // Handle auto-return when expired or no products
    useEffect(() => {
        if (timeLeft.isExpired || flashProducts.length === 0) {
            const timer = setTimeout(() => {
                onBack();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft.isExpired, flashProducts.length, onBack]);

    if (flashProducts.length === 0 || timeLeft.isExpired) {
        return (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-12 text-center space-y-4 my-8">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Flame size={32} className="animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sesi Flash Sale Telah Berakhir</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                    Mohon maaf, promo Flash Sale saat ini sedang tidak aktif. Anda akan dialihkan kembali ke beranda utama...
                </p>
                <button
                    onClick={onBack}
                    className="mt-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition uppercase tracking-wider"
                >
                    Kembali Sekarang
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 my-6">
            {/* Breadcrumbs & Back Nav */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                <button onClick={onBack} className="hover:text-red-650 transition">Beranda</button>
                <span>/</span>
                <span className="text-slate-800">Flash Sale</span>
            </div>

            {/* Flash Sale Premium Header Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-red-600 via-red-800 to-red-950 text-white shadow-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(253,224,71,0.15),transparent_50%)]" />
                
                <div className="space-y-3 z-10">
                    <button
                        onClick={onBack}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 transition cursor-pointer backdrop-blur-xs"
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                        <Flame className="fill-yellow-400 text-yellow-400 animate-bounce" size={26} />
                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-wider text-yellow-400 font-sans">
                            ⚡ Flash Sale Kebut-Kebutan!
                        </h2>
                    </div>
                    <p className="text-xs md:text-sm text-red-100 font-medium max-w-md">
                        Dapatkan suku cadang premium dan aksesoris mobil impian Anda dengan harga spesial terbatas. Stok cepat habis!
                    </p>
                </div>

                {/* Big Countdown Box */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/10 text-center space-y-2.5 z-10 self-start md:self-auto min-w-[240px] shadow-2xl">
                    <span className="text-[10px] md:text-xs font-black text-red-200 uppercase tracking-widest block">
                        Sisa Waktu Promo:
                    </span>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="flex flex-col items-center">
                            <span className="bg-slate-950 text-yellow-400 font-mono font-black text-xl md:text-2xl px-3 py-1.5 rounded-xl shadow-md border border-white/5">
                                {formatNumber(timeLeft.hours)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Jam</span>
                        </div>
                        <span className="text-yellow-400 font-bold text-lg md:text-xl -mt-4 animate-pulse">:</span>
                        <div className="flex flex-col items-center">
                            <span className="bg-slate-950 text-yellow-400 font-mono font-black text-xl md:text-2xl px-3 py-1.5 rounded-xl shadow-md border border-white/5">
                                {formatNumber(timeLeft.minutes)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Menit</span>
                        </div>
                        <span className="text-yellow-400 font-bold text-lg md:text-xl -mt-4 animate-pulse">:</span>
                        <div className="flex flex-col items-center">
                            <span className="bg-slate-950 text-yellow-400 font-mono font-black text-xl md:text-2xl px-3 py-1.5 rounded-xl shadow-md border border-white/5">
                                {formatNumber(timeLeft.seconds)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Detik</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {flashProducts.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-white hover:bg-slate-50/20 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-between transition duration-300 hover:shadow-2xl hover:shadow-red-500/5 hover:-translate-y-1 group relative"
                    >
                        {/* Image & Discount */}
                        <div 
                            onClick={() => onProductClick(prod)}
                            className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50 cursor-pointer"
                        >
                            <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            {/* Discount Tag */}
                            {prod.discount > 0 && (
                                <div className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded shadow-md">
                                    -{prod.discount}%
                                </div>
                            )}
                        </div>

                        {/* Text & Price Area */}
                        <div className="space-y-1.5 grow flex flex-col justify-between">
                            <h4 
                                onClick={() => onProductClick(prod)}
                                className="text-xs md:text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug cursor-pointer hover:text-red-650 transition"
                            >
                                {prod.name}
                            </h4>

                            <div>
                                <div className="flex items-baseline space-x-1.5 mt-1">
                                    <span className="text-sm md:text-base font-black text-rose-600">
                                        Rp {(prod.price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                {prod.discount > 0 && prod.originalPrice && (
                                    <span className="text-[10px] md:text-xs text-slate-400 line-through">
                                        Rp {(prod.originalPrice).toLocaleString('id-ID')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar & Actions */}
                        <div className="mt-4 space-y-3">
                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative flex items-center justify-center border border-slate-200/40">
                                <div 
                                    className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-orange-500 to-red-650 transition-all duration-1000"
                                    style={{ width: `${prod.soldPercent}%` }}
                                />
                                <span className="relative z-10 text-[9px] font-black text-white uppercase drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.6)]">
                                    {prod.remaining === 0 ? 'Habis Terjual' : `Sisa ${prod.remaining} Unit`}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onProductClick(prod)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center uppercase tracking-wider border border-slate-200/60"
                                >
                                    <Info size={12} className="mr-1" />
                                    <span>Detail</span>
                                </button>
                                <button
                                    onClick={() => onAddToCart(prod, 1)}
                                    disabled={prod.remaining === 0}
                                    className="flex-1 bg-linear-to-r from-red-600 to-red-950 hover:shadow-md hover:shadow-red-500/10 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={12} className="mr-1" />
                                    <span>Beli</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
