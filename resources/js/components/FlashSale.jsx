import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight } from 'lucide-react';

const FLASH_PRODUCTS = [
    {
        id: 6,
        name: 'Kamera Dashboard 70mai Dashcam A800S 4K HDR',
        price: 1450000,
        originalPrice: 1750000,
        discount: 17,
        image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=600&q=80',
        soldPercent: 85,
        soldQty: 102
    },
    {
        id: 8,
        name: 'Paket Coating Ceramic Nano 3 Layer - Car Salon',
        price: 3499000,
        originalPrice: 4500000,
        discount: 22,
        image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
        soldPercent: 65,
        soldQty: 24
    },
    {
        id: 5,
        name: 'Oli Mesin Shell Helix Ultra 5W-40 4 Liter',
        price: 520000,
        originalPrice: 600000,
        discount: 13,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        soldPercent: 92,
        soldQty: 165
    },
    {
        id: 10,
        name: 'Lampu LED Headlight Osram FOG H8/H11/H16',
        price: 850000,
        originalPrice: 990000,
        discount: 14,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        soldPercent: 40,
        soldQty: 28
    }
];

export default function FlashSale({ onProductClick }) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 45,
        seconds: 30
    });

    // Countdown Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    // Reset timer to simulate endless loop
                    return { hours: 3, minutes: 0, seconds: 0 };
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num) => String(num).padStart(2, '0');

    // Ambil full product info dari id saat diklik
    const handleProductClick = (id) => {
        // Mock product mapping (we can just load mock information or find it)
        const products = [
            {
                id: 6,
                name: 'Kamera Dashboard 70mai Dashcam A800S 4K HDR',
                category: 'Aksesoris',
                price: 1450000,
                originalPrice: 1750000,
                discount: 17,
                rating: 4.8,
                sold: 120,
                image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=600&q=80',
                badge: 'Flash Sale',
                description: 'Dashcam 70mai A800S menghasilkan rekaman berkualitas bioskop 4K Ultra HD dengan sensor gambar Sony IMX415. Dilengkapi built-in GPS, sistem bantuan pengemudi ADAS, pemantauan parkir 24 jam (dengan hardwire kit), dan kontrol aplikasi via Wi-Fi.',
                specs: {
                    'Resolusi': '3840x2160p (4K)',
                    'Sensor Kamera': 'Sony IMX415',
                    'Lensa': 'Super Wide Angle 140°',
                    'Layar': '3.0 inci IPS'
                },
                variants: ['Front Cam Only', 'Front + Rear Cam']
            },
            {
                id: 8,
                name: 'Paket Coating Ceramic Nano 3 Layer - Car Salon',
                category: 'Jasa Servis',
                price: 3499000,
                originalPrice: 4500000,
                discount: 22,
                rating: 5.0,
                sold: 38,
                image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
                badge: 'Rekomendasi',
                description: 'Paket perlindungan cat mobil premium menggunakan cairan Ceramic Nano Glass 9H sebanyak 3 layer. Menghasilkan efek daun talas (hydrophobic), mencegah jamur cat/waterspot, melindungi dari sinar UV perusak warna, dan kilau kaca super wet-look bergaransi 2 tahun.',
                specs: {
                    'Durasi Pengerjaan': '2 Hari (Wajib Booking)',
                    'Lapisan (Layer)': '3 Layer Nano Ceramic 9H',
                    'Garansi': '2 Tahun Perawatan Rutin',
                    'Lokasi': 'Workshop Putri Jaya Mobil (Bekasi)'
                },
                variants: ['City Car', 'SUV / Sedan', 'MPV / Big SUV']
            },
            {
                id: 5,
                name: 'Oli Mesin Shell Helix Ultra 5W-40 4 Liter',
                category: 'Oli & Aki',
                price: 520000,
                originalPrice: 600000,
                discount: 13,
                rating: 4.9,
                sold: 180,
                image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
                badge: '100% Original',
                description: 'Shell Helix Ultra 5W-40 merupakan pelumas mesin sintetis penuh (fully synthetic) dengan PurePlus Technology, menjaga mesin tetap bersih layaknya baru dari pabrik serta memberikan perlindungan maksimal dari keausan dan korosi.',
                specs: {
                    'Viskositas': 'SAE 5W-40',
                    'Volume': '4 Liter',
                    'Spesifikasi API': 'API SP / SN Plus, ACEA A3/B4',
                    'Jenis Mesin': 'Bensin dan Diesel'
                },
                variants: ['4 Liter']
            },
            {
                id: 10,
                name: 'Lampu LED Headlight Osram LEDriving FOG H8/H11/H16',
                category: 'Kelistrikan',
                price: 850000,
                originalPrice: 990000,
                discount: 14,
                rating: 4.7,
                sold: 72,
                image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
                badge: 'Cahaya Terang',
                description: 'Lampu LED Osram menggantikan lampu halogen kabut standar dengan cahaya LED putih terang 6000K yang stylish. Menawarkan visibilitas yang jauh lebih baik tanpa menyilaukan pengendara dari arah berlawanan.',
                specs: {
                    'Tipe Socket': 'H8 / H11 / H16',
                    'Temperatur Warna': '6000 Kelvin (Putih)',
                    'Daya Listrik': '8.2 Watt per Bohlam',
                    'Umur Pakai': 'Hingga 5000 Jam'
                },
                variants: ['Putih 6000K', 'Kuning 3000K']
            }
        ];
        
        const found = products.find(p => p.id === id);
        if (found) onProductClick(found);
    };

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

                <a href="#" className="flex items-center text-xs font-semibold text-yellow-300 hover:text-yellow-400 transition">
                    <span>Lihat Semua</span>
                    <ChevronRight size={15} />
                </a>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
                {FLASH_PRODUCTS.map((prod) => (
                    <div
                        key={prod.id}
                        onClick={() => handleProductClick(prod.id)}
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
                            <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded shadow">
                                -{prod.discount}%
                            </div>
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
                            <span className="text-[10px] md:text-xs text-slate-400 line-through">
                                Rp {(prod.originalPrice).toLocaleString('id-ID')}
                            </span>
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
                                    {prod.soldPercent >= 90 ? 'Segera Habis' : `${prod.soldQty} Terjual`}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
