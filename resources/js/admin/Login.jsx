import React, { useState } from 'react';
import axios from 'axios';
import { LogIn, Key, Mail, ShieldAlert, Eye, EyeOff, Car, Shield, Info, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const res = await axios.post('/adminv1/api/login', {
                email,
                password,
                remember
            });

            if (res.data && res.data.status === 'success') {
                onLoginSuccess();
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response && err.response.data && err.response.data.message) {
                setErrors({ general: [err.response.data.message] });
            } else {
                setErrors({ general: ['Terjadi kesalahan. Silakan coba kembali beberapa saat lagi.'] });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-zinc-900 text-slate-100 overflow-hidden font-sans">
            {/* Left Column: Visual Branding (Hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 shrink-0 relative flex-col justify-between p-10 lg:p-12 overflow-hidden border-r border-zinc-800">
                {/* Background Image with Premium Dark Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
                    style={{ backgroundImage: "url('/images/admin_login_bg.png')" }}
                />
                <div className="absolute inset-0 bg-red-950/30" />
                <div className="absolute inset-0 bg-linear-to-r from-red-950 via-red-950/40 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-red-950/80 via-transparent to-red-950/20" />

                {/* Top Corner: Brand Logo */}
                <div className="relative z-10 flex items-center space-x-3 bg-zinc-900/90 border border-zinc-800/60 backdrop-blur-md px-4 py-2.5 rounded-2xl self-start">
                    <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-lg">
                        <Car className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-white tracking-wider text-xs block">PJM Admin</span>
                        <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-widest block -mt-1">Putri Jaya Mobil</span>
                    </div>
                </div>

                {/* Center Brand Concept inside glassmorphism container */}
                <div className="relative z-10 max-w-lg mt-auto mb-auto bg-zinc-900/85 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-wider text-red-400 mb-6">
                        <Shield size={12} />
                        <span>Sistem Manajemen Terintegrasi</span>
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tight">
                        KENDALI PENUH <br />
                        <span className="bg-linear-to-r from-red-400 to-zinc-400 bg-clip-text text-transparent">SUKU CADANG & STOK</span>
                    </h2>
                    <p className="text-slate-300 text-xs mt-3.5 font-medium leading-relaxed">
                        Kelola data inventaris, staff operasional, dan relasi pelanggan secara instan dalam satu platform backend premium.
                    </p>
                </div>

                {/* Bottom Row */}
                <div className="relative z-10 flex justify-between items-center text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-6">
                    <span className="font-bold">© {new Date().getFullYear()} Putri Jaya Mobil.</span>
                    <div className="flex space-x-4">
                        <span className="hover:text-red-400 transition font-bold cursor-pointer">Panduan Admin</span>
                        <span className="hover:text-red-400 transition font-bold cursor-pointer">Bantuan</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Card Pane */}
            <div className="w-full md:w-1/2 lg:w-2/5 shrink-0 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-zinc-900 relative z-10 overflow-y-auto min-h-screen">
                {/* Decorative Ambient Background Glow (Behind Card) */}
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[360px] w-full mx-auto relative z-10">
                    {/* Header on mobile */}
                    <div className="flex md:hidden items-center space-x-3 mb-8 bg-zinc-900/80 border border-zinc-800/60 backdrop-blur-md px-4 py-2.5 rounded-2xl self-start">
                        <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-lg">
                            <Car className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-white tracking-wide text-xs block">PJM Admin</span>
                            <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-widest block -mt-1">Putri Jaya Mobil</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-white tracking-wide uppercase">SILAKAN MASUK</h3>
                        <p className="text-slate-400 text-xs mt-1 font-semibold">Selamat datang kembali! Gunakan akun admin/staff Anda.</p>
                    </div>

                    {/* General Errors Notification */}
                    {errors.general && (
                        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start space-x-3 text-xs text-rose-300 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
                            <span className="font-semibold">{errors.general[0]}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Alamat Email
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-500">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@pjm.com"
                                    className={`w-full pl-11 pr-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs focus:outline-hidden transition duration-200 text-slate-100 placeholder-zinc-500 font-semibold focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-rose-400 text-[10px] mt-1 font-bold">{errors.email[0]}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Kata Sandi
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-500">
                                    <Key size={16} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-11 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs focus:outline-hidden transition duration-200 text-slate-100 placeholder-zinc-500 font-semibold focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-slate-500 hover:text-white transition focus:outline-hidden cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-rose-400 text-[10px] mt-1 font-bold">{errors.password[0]}</p>
                            )}
                        </div>

                        {/* Remember Me checkbox */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center space-x-2.5 text-[11px] text-slate-400 hover:text-slate-300 transition cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-4 w-4 bg-zinc-950 border-zinc-800 rounded-md focus:ring-red-500/30 text-red-600 transition"
                                />
                                <span className="font-bold">Ingat saya di perangkat ini</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-red-600/10 hover:shadow-red-500/20 transition duration-300 flex items-center justify-center space-x-2 cursor-pointer mt-4 text-xs tracking-wider uppercase"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Masuk ke Panel</span>
                                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Helper Box */}
                    <div className="mt-8 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4.5">
                        <div className="flex items-start space-x-2.5 text-[10px] text-slate-400 leading-relaxed font-semibold">
                            <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-slate-300 font-bold block mb-1">Akses Uji Coba Default:</span>
                                <div className="space-y-1">
                                    <div>Admin: <span className="text-red-400">admin@pjm.com</span> / <span className="text-red-400">password</span></div>
                                    <div>Staff: <span className="text-red-400">staff@pjm.com</span> / <span className="text-red-400">password</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
