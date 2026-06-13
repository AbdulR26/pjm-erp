import React from 'react';
import { Search, ShoppingCart, Bell, HelpCircle, User, Car, MessageSquare, ChevronDown } from 'lucide-react';

const FacebookIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

export default function Header({ cartCount, searchQuery, setSearchQuery, onOpenCart }) {
    return (
        <header className="bg-linear-to-r from-red-600 to-red-950 text-white shadow-md sticky top-0 z-40">
            {/* Top Bar (Shopee Style) */}
            <div className="border-b border-white/10 text-xs py-1.5 hidden md:block">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <a href="#" className="hover:text-red-200 transition">Seller Centre</a>
                        <span className="text-white/30">|</span>
                        <a href="#" className="hover:text-red-200 transition">Mulai Jual</a>
                        <span className="text-white/30">|</span>
                        <a href="#" className="hover:text-red-200 transition">Download Aplikasi</a>
                        <span className="text-white/30">|</span>
                        <div className="flex items-center space-x-1.5">
                            <span>Ikuti kami di</span>
                            <a href="#" className="hover:text-red-200 transition"><FacebookIcon size={13} /></a>
                            <a href="#" className="hover:text-red-200 transition"><InstagramIcon size={13} /></a>
                            <a href="#" className="hover:text-red-200 transition"><MessageSquare size={13} /></a>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a href="#" className="flex items-center space-x-1 hover:text-red-200 transition">
                            <Bell size={13} />
                            <span>Notifikasi</span>
                        </a>
                        <a href="#" className="flex items-center space-x-1 hover:text-red-200 transition">
                            <HelpCircle size={13} />
                            <span>Bantuan</span>
                        </a>
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-red-200 transition">
                            <span>Bahasa Indonesia</span>
                            <ChevronDown size={12} />
                        </div>
                        <div className="flex items-center space-x-1.5 cursor-pointer hover:text-red-200 transition font-semibold">
                            <User size={13} />
                            <span>Abdul Rohman</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header Bar */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center justify-between">
                    <a href="/" className="flex items-center space-x-2 group">
                        <div className="bg-white text-red-600 p-2 rounded-xl shadow-lg shadow-red-950/20 group-hover:scale-105 transition duration-300">
                            <Car className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold tracking-wide bg-linear-to-r from-white to-red-200 bg-clip-text text-transparent">
                                Putri Jaya Mobil
                            </span>
                            <span className="block text-[10px] text-red-200 tracking-wider -mt-1 font-semibold uppercase">
                                Premium E-Commerce
                            </span>
                        </div>
                    </a>
                    
                    {/* Cart Icon Mobile Only */}
                    <button 
                        onClick={onOpenCart} 
                        className="relative p-2 md:hidden hover:bg-white/10 rounded-full transition"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-950 font-bold text-[10px] h-5 w-5 flex items-center justify-center rounded-full border border-red-600 animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-[700px] md:mx-6">
                    <div className="relative flex items-center bg-white rounded-lg p-1 shadow-inner text-slate-800">
                        <input
                            type="text"
                            placeholder="Cari mobil impian Anda, aksesoris premium, ban, oli..."
                            className="w-full pl-3 pr-10 py-2 text-sm focus:outline-none placeholder-slate-400 bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-linear-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-5 py-2 rounded-md transition duration-200 shadow-md flex items-center justify-center">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="hidden md:flex flex-wrap items-center mt-1.5 gap-x-3 gap-y-1 text-[11px] text-red-100/90">
                        <span className="font-medium">Populer:</span>
                        <button onClick={() => setSearchQuery('Honda Civic')} className="hover:underline">Honda Civic</button>
                        <button onClick={() => setSearchQuery('Velg HSR')} className="hover:underline">Velg HSR</button>
                        <button onClick={() => setSearchQuery('Coating')} className="hover:underline">Coating Ceramic</button>
                        <button onClick={() => setSearchQuery('Oli Shell')} className="hover:underline">Oli Shell</button>
                        <button onClick={() => setSearchQuery('Aki Kering')} className="hover:underline">Aki Kering</button>
                    </div>
                </div>

                {/* Cart Icon Desktop */}
                <div className="hidden md:flex items-center space-x-6">
                    <button 
                        onClick={onOpenCart} 
                        className="relative p-2.5 hover:bg-white/10 rounded-xl transition duration-300 group flex items-center space-x-2 border border-white/10 bg-white/5"
                    >
                        <ShoppingCart className="h-6 w-6 group-hover:scale-105 transition" />
                        <span className="text-sm font-medium hidden lg:inline">Keranjang</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-950 font-extrabold text-xs h-5 w-5 flex items-center justify-center rounded-full border-2 border-red-700 shadow-md">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
