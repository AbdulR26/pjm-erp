import { useState, useEffect } from 'react';
import { getWhatsAppLink, getStoreName } from '../utils/helpers';

export default function useHeroCarousel() {
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

    const defaultWaLink = getWhatsAppLink(
        settings,
        `Halo ${getStoreName(settings)}, saya ingin konsultasi mengenai spesifikasi suku cadang mobil saya.`
    );

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

    return {
        banners,
        settings,
        loading,
        activeIndex,
        setActiveIndex,
        nextSlide,
        prevSlide,
        side1,
        side2
    };
}
