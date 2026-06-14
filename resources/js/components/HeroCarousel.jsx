import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function HeroCarousel() {
    const [banners, setBanners] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Load active banners and settings from database
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/api/banners').then(res => res.json()),
            fetch('/api/settings').then(res => res.json())
        ])
        .then(([bannersData, settingsData]) => {
            setBanners(bannersData);
            setSettings(settingsData || {});
            setLoading(false);
        })
        .catch(err => {
            console.error("Gagal mengambil data banner/settings:", err);
            setLoading(false);
        });
    }, []);

    // Auto slide change
    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    const nextSlide = () => {
        if (banners.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        if (banners.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const whatsappNumber = settings.store_whatsapp || '6281234567890';
    const defaultWaLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Halo ${settings.store_name || 'Putri Jaya Mobil'}, saya ingin konsultasi mengenai spesifikasi suku cadang mobil saya.`
    )}`;

    const side1 = {
        badge: settings.side_banner_1_badge || 'KONSULTASI GRATIS',
        title: settings.side_banner_1_title || 'Bingung Cari\nPart Number / Seri?',
        subtitle: settings.side_banner_1_subtitle || 'Kirim foto STNK & part Anda ke WhatsApp kami!',
        image: settings.side_banner_1_image || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80',
        link: settings.side_banner_1_link || defaultWaLink
    };

    const side2 = {
        badge: settings.side_banner_2_badge || 'JAMINAN ORISINIL',
        title: settings.side_banner_2_title || '100% Suku Cadang Asli',
        subtitle: settings.side_banner_2_subtitle || 'Garansi uang kembali penuh jika palsu.',
        image: settings.side_banner_2_image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
        link: settings.side_banner_2_link || '#'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4 animate-in fade-in duration-300">
            {/* Main Carousel Banner (Col Span 2) */}
            <div className="lg:col-span-2 relative h-[220px] md:h-[320px] rounded-lg overflow-hidden group shadow-md bg-slate-200 flex items-center justify-center">
                {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                        <span className="text-xs text-slate-500 font-semibold">Memuat promo...</span>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="text-slate-400 text-xs font-semibold">Tidak ada promo aktif</div>
                ) : (
                    <>
                        {/* Slides */}
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                    index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                            >
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-linear-to-r from-red-955/90 via-red-955/45 to-transparent z-10" />
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Text Content */}
                                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-20 max-w-[80%] text-white">
                                    {banner.badge && (
                                        <span className="bg-yellow-400 text-black text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full w-max mb-3 uppercase tracking-wider">
                                            {banner.badge}
                                        </span>
                                    )}
                                    <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2.5 drop-shadow-md">
                                        {banner.title}
                                    </h2>
                                    {banner.subtitle && (
                                        <p className="text-xs md:text-sm text-red-100 mb-5 leading-relaxed hidden sm:block">
                                            {banner.subtitle}
                                        </p>
                                    )}
                                    {banner.link ? (
                                        <a 
                                            href={banner.link}
                                            className="bg-red-650 hover:bg-red-600 text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-lg w-max shadow-lg hover:shadow-red-500/25 transition duration-300 block text-center"
                                        >
                                            {banner.button_text || 'Detail'}
                                        </a>
                                    ) : (
                                        <button className="bg-red-650 hover:bg-red-600 text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-lg w-max shadow-lg hover:shadow-red-500/25 transition duration-300">
                                            {banner.button_text || 'Detail'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Left/Right Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 focus:outline-none cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 focus:outline-none cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Side Static Promotion Cards (Shopee Style) */}
            <div className="flex flex-row lg:flex-col gap-3 h-full">
                {/* Side Banner 1 */}
                <div className="flex-1 relative h-[105px] md:h-[153px] max-h-[105px] md:max-h-[153px] rounded-lg overflow-hidden shadow-md group">
                    <a
                        href={side1.link}
                        target={side1.link.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-30"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-red-800/90 to-red-950/60 z-10" />
                    <img
                        src={side1.image}
                        alt={side1.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => { e.target.src = '/images/default-product.png'; }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-5 z-20 text-white">
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">{side1.badge}</span>
                        <h3 className="font-bold text-sm md:text-base leading-tight mb-1 whitespace-pre-line">
                            {side1.title}
                        </h3>
                        <p className="text-[10px] text-red-100 hidden md:block">{side1.subtitle}</p>
                    </div>
                </div>

                {/* Side Banner 2 */}
                <div className="flex-1 relative h-[105px] md:h-[153px] max-h-[105px] md:max-h-[153px] rounded-lg overflow-hidden shadow-md group">
                    <a
                        href={side2.link}
                        target={side2.link.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-30"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-red-900/95 to-red-950/65 z-10" />
                    <img
                        src={side2.image}
                        alt={side2.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => { e.target.src = '/images/default-product.png'; }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-5 z-20 text-white">
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">{side2.badge}</span>
                        <h3 className="font-bold text-sm md:text-base leading-tight mb-1 whitespace-pre-line">
                            {side2.title}
                        </h3>
                        <p className="text-[10px] text-red-100 hidden md:block">{side2.subtitle}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
