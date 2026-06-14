import React from 'react';
import { MessageCircle, ShieldCheck, Award, ThumbsUp } from 'lucide-react';

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

const TwitterIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

export default function Footer({ settings = {} }) {
    const storeName = settings.store_name || 'Putri Jaya Mobil';
    const storeAddress = settings.store_address || 'Showroom Utama: Jl. Raya Jenderal Sudirman No. 45, Bekasi Barat, Jawa Barat.';
    const facebookLink = settings.social_facebook || '#';
    const instagramLink = settings.social_instagram || '#';
    const tiktokLink = settings.social_tiktok || '#';
    const whatsappNumber = settings.store_whatsapp || '6281234567890';
    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    return (
        <footer className="bg-zinc-900 text-slate-300">
            {/* Value Proposition Bar */}
            <div className="bg-linear-to-r from-red-600 to-red-950 py-6 border-b border-slate-800 text-white">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
                        <div className="bg-white/10 p-3 rounded-full">
                            <ShieldCheck className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Jaminan Keamanan 100%</h4>
                            <p className="text-xs text-red-100 mt-0.5">Semua transaksi diverifikasi oleh staf ahli kami secara manual.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
                        <div className="bg-white/10 p-3 rounded-full">
                            <Award className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Produk Bergaransi & Original</h4>
                            <p className="text-xs text-red-100 mt-0.5">Jaminan keaslian onderdil atau uang kembali penuh.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
                        <div className="bg-white/10 p-3 rounded-full">
                            <ThumbsUp className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Layanan Pelanggan Responsif</h4>
                            <p className="text-xs text-red-100 mt-0.5">Staf support WhatsApp kami siap melayani Anda 24/7 jam kerja.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Col 1 */}
                <div>
                    <h5 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Layanan Pelanggan</h5>
                    <ul className="space-y-2.5 text-xs font-semibold">
                        <li><a href="#" className="hover:text-white transition">Pusat Bantuan</a></li>
                        <li><a href="#" className="hover:text-white transition">Cara Pembelian</a></li>
                        <li><a href="#" className="hover:text-white transition">Pengiriman & Lacak</a></li>
                        <li><a href="#" className="hover:text-white transition">Pengembalian Barang & Dana</a></li>
                        <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Hubungi Kami (WhatsApp)</a></li>
                    </ul>
                </div>

                {/* Col 2 */}
                <div>
                    <h5 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Tentang Kami</h5>
                    <ul className="space-y-2.5 text-xs font-semibold">
                        <li><a href="#" className="hover:text-white transition">Profil {storeName}</a></li>
                        <li><a href="#" className="hover:text-white transition">Karir / Rekrutmen</a></li>
                        <li><a href="#" className="hover:text-white transition">Kebijakan Privasi</a></li>
                        <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
                        <li><a href="#" className="hover:text-white transition">Lokasi Showroom & Bengkel</a></li>
                    </ul>
                </div>

                {/* Col 3 */}
                <div>
                    <h5 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Pembayaran & Pengiriman</h5>
                    <div className="mb-4">
                        <p className="text-[10px] text-slate-500 font-bold mb-2">METODE TRANSFER BANK:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">BCA</span>
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">MANDIRI</span>
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">BRI</span>
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">BNI</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold mb-2">MITRA LOGISTIK KAMI:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">J&T Cargo</span>
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">JNE Express</span>
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">Sicepat</span>
                            <span className="bg-slate-800 text-white text-[10px] font-extrabold px-2 py-1.5 rounded">Self Pickup</span>
                        </div>
                    </div>
                </div>

                {/* Col 4 */}
                <div>
                    <h5 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Ikuti Media Sosial Kami</h5>
                    <div className="flex items-center space-x-3 mb-6">
                        <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition">
                            <FacebookIcon size={16} />
                        </a>
                        <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                            <InstagramIcon size={16} />
                        </a>
                        <a href={tiktokLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-zinc-700 hover:text-white transition">
                            <TwitterIcon size={16} />
                        </a>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">
                            <MessageCircle size={16} />
                        </a>
                    </div>
                    
                    <h5 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-2">LAYANAN CUSTOMER {storeName.toUpperCase()}</h5>
                    <p className="text-xs font-semibold text-slate-400 leading-normal">
                        {storeAddress}
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 py-6 text-center text-[11px] text-slate-500 font-medium">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col md:flex-row md:justify-between items-center gap-3">
                    <p>© {new Date().getFullYear()} {storeName}. Hak Cipta Dilindungi Undang-Undang.</p>
                    <p className="text-slate-650">Simulasi Antarmuka E-Commerce Otomotif Premium. Dikembangkan dengan React & Laravel.</p>
                </div>
            </div>
        </footer>
    );
}
