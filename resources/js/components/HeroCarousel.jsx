import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BANNERS = [
    {
        id: 1,
        title: 'Promo Suku Cadang Orisinil Terlengkap',
        subtitle: 'Dapatkan diskon hingga 15% untuk kampas rem Bendix, shockbreaker Tein, & filter udara K&N. Jaminan 100% Asli!',
        buttonText: 'Belanja Suku Cadang',
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
        badge: 'Promo Suku Cadang'
    },
    {
        id: 2,
        title: 'Upgrade Suspensi & Kaki-Kaki Mobil',
        subtitle: 'Hemat hingga 20% untuk paket Shockbreaker Tein EnduraPro, Velg Racing HSR, & Ban Michelin.',
        buttonText: 'Belanja Kaki-Kaki',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
        badge: 'Kaki-Kaki & Suspensi'
    },
    {
        id: 3,
        title: 'Paket Tune-Up & Ganti Oli Mesin',
        subtitle: 'Dapatkan performa mesin maksimal dengan paket ganti Oli Shell Helix Ultra, filter Sakura, & gurah mesin.',
        buttonText: 'Booking Servis Mesin',
        image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
        badge: 'Servis & Bengkel'
    }
];

export default function HeroCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto slide change
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % BANNERS.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
            {/* Main Carousel Banner (Col Span 2) */}
            <div className="lg:col-span-2 relative h-[220px] md:h-[320px] rounded-lg overflow-hidden group shadow-md">
                {/* Slides */}
                {BANNERS.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-r from-red-950/90 via-red-950/45 to-transparent z-10" />
                        <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Text Content */}
                        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-20 max-w-[80%] text-white">
                            <span className="bg-yellow-400 text-black text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full w-max mb-3 uppercase tracking-wider">
                                {banner.badge}
                            </span>
                            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2.5 drop-shadow-md">
                                {banner.title}
                            </h2>
                            <p className="text-xs md:text-sm text-red-100 mb-5 leading-relaxed hidden sm:block">
                                {banner.subtitle}
                            </p>
                            <button className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-lg w-max shadow-lg hover:shadow-red-500/25 transition duration-300">
                                {banner.buttonText}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Left/Right Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 focus:outline-none"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 focus:outline-none"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                    {BANNERS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Side Static Promotion Cards (Shopee Style) */}
            <div className="flex flex-row lg:flex-col gap-3 h-full">
                {/* Side Banner 1 */}
                <div className="flex-1 relative h-[105px] md:h-[153px] rounded-lg overflow-hidden shadow-md group">
                    <div className="absolute inset-0 bg-linear-to-r from-red-800/90 to-red-950/60 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80"
                        alt="Konsultasi Suku Cadang"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-5 z-20 text-white">
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">KONSULTASI GRATIS</span>
                        <h3 className="font-bold text-sm md:text-base leading-tight mb-1">
                            Bingung Cari <br className="hidden md:inline" /> Part Number / Seri?
                        </h3>
                        <p className="text-[10px] text-red-100 hidden md:block">Kirim foto STNK & part Anda ke WhatsApp kami!</p>
                    </div>
                </div>

                {/* Side Banner 2 */}
                <div className="flex-1 relative h-[105px] md:h-[153px] rounded-lg overflow-hidden shadow-md group">
                    <div className="absolute inset-0 bg-linear-to-r from-red-900/95 to-red-950/65 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
                        alt="Spare Parts"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-5 z-20 text-white">
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">JAMINAN ORISINIL</span>
                        <h3 className="font-bold text-sm md:text-base leading-tight mb-1">
                            100% Suku Cadang Asli
                        </h3>
                        <p className="text-[10px] text-red-100 hidden md:block">Garansi uang kembali penuh jika palsu.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
