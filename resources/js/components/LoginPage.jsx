import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, HelpCircle, ShieldCheck, ShoppingBag, CheckCircle2, KeyRound, RefreshCw, AlertCircle } from 'lucide-react';
import useLoginPage from '../hooks/useLoginPage';
import '../../css/login.css';
import { getWhatsAppLink, getStoreName } from '../utils/helpers';

export default function LoginPage({ onBack, reason, onLoginSuccess, settings = {} }) {
    const {
        activeTab,
        loading,
        errors,
        generalError,
        needsActivation, setNeedsActivation,
        unverifiedEmail,
        otpDigits, setOtpDigits,
        otpError,
        resendMessage,
        countdown,
        formatTimer,
        name, setName,
        email, setEmail,
        phone, setPhone,
        password, setPassword,
        handleLoginSubmit,
        handleRegisterSubmit,
        handleOtpChange,
        handleVerifyOtpSubmit,
        handleResendOtp,
        switchTab
    } = useLoginPage(onLoginSuccess);

    const [showPassword, setShowPassword] = useState(false);
    const storeName = getStoreName(settings);
    const inputRefs = useRef([]);

    // Auto-focus next input box for OTP
    const handleDigitInput = (index, e) => {
        const val = e.target.value;
        handleOtpChange(index, val);

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
            {/* Shopee-style Header (Red Store Theme) */}
            <header className="h-[84px] bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
                        <div className="flex items-center gap-2">
                            {settings.logo_url ? (
                                <img src={settings.logo_url} alt={storeName} className="h-10 w-auto object-contain" />
                            ) : (
                                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white font-black flex items-center justify-center text-xl shadow-md">
                                    P
                                </div>
                            )}
                            <span className="font-extrabold text-slate-800 text-xl tracking-tight hidden sm:inline">
                                {storeName}
                            </span>
                        </div>
                        <span className="h-6 w-px bg-slate-200"></span>
                        <h1 className="text-slate-800 font-extrabold text-lg sm:text-xl">
                            {needsActivation ? 'Aktivasi OTP' : (activeTab === 'login' ? 'Masuk' : 'Daftar')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <a
                            href={getWhatsAppLink(settings, "Halo, saya butuh bantuan mengenai aktivasi akun / OTP di Putri Jaya Mobil.")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:underline flex items-center gap-1.5 font-bold"
                        >
                            <HelpCircle size={15} />
                            <span>Butuh bantuan?</span>
                        </a>

                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold"
                        >
                            <ArrowLeft size={14} />
                            <span>Ke Beranda</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Shopee-style Hero Banner & Form Body */}
            <main className="grow bg-linear-to-r from-red-600 via-red-700 to-red-950 py-8 md:py-14 flex items-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-black/20 blur-3xl pointer-events-none"></div>

                <div className="max-w-[1200px] mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    
                    {/* Left Column: Store Branding & Features */}
                    <div className="hidden lg:flex lg:col-span-7 flex-col justify-center text-white space-y-6 pr-6">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold w-fit tracking-wide uppercase border border-white/20">
                            <ShoppingBag size={14} /> Official Store Otomotif
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                            Pusat Suku Cadang & Aksesoris Mobil Terlengkap
                        </h2>

                        <p className="text-white/90 text-sm font-medium leading-relaxed max-w-lg">
                            Nikmati kemudahan transaksi, jaminan sparepart original 100%, pengiriman cepat, dan penawaran diskon eksklusif bagi pelanggan setia {storeName}.
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm font-semibold">
                                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span>Ribuan Produk Sparepart & Aksesoris Teruji</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-semibold">
                                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span>Aktivasi Akun Aman dengan Verifikasi Kode OTP Email</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-semibold">
                                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span>Keamanan Transaksi & Data Pengguna Terjamin</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Card (Login / Register OR OTP Screen) */}
                    <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 w-full max-w-[430px] transition-all duration-300">
                            
                            {needsActivation ? (
                                /* ─── OTP VERIFICATION FORM ─── */
                                <div className="space-y-5">
                                    <div className="text-center space-y-2">
                                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                                            <KeyRound size={28} />
                                        </div>
                                        <h2 className="text-xl font-extrabold text-slate-800">Verifikasi Kode OTP</h2>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Masukkan 6 digit kode OTP yang dikirimkan ke email:<br />
                                            <strong className="text-slate-800">{unverifiedEmail}</strong>
                                        </p>
                                    </div>

                                    {otpError && (
                                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span>{otpError}</span>
                                        </div>
                                    )}

                                    {resendMessage && (
                                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                                            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                                            <span>{resendMessage}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                                        {/* 6 Digit Inputs */}
                                        <div className="flex justify-between gap-1.5 sm:gap-2">
                                            {otpDigits.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    ref={(el) => (inputRefs.current[idx] = el)}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleDigitInput(idx, e)}
                                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 transition font-mono"
                                                    required
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Memverifikasi...</span>
                                                </>
                                            ) : (
                                                <span>VERIFIKASI & AKTIFKAN</span>
                                            )}
                                        </button>
                                    </form>

                                    <div className="pt-2 border-t border-slate-100 flex flex-col items-center space-y-3 text-xs">
                                        {countdown > 0 ? (
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-100 px-3.5 py-2 rounded-full border border-slate-200">
                                                <RefreshCw size={13} className="animate-spin text-red-600 shrink-0" />
                                                <span>Kirim ulang OTP dalam <strong className="text-red-600 font-mono text-xs">{formatTimer(countdown)}</strong></span>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition hover:scale-105"
                                            >
                                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                                <span>Kirim Ulang Kode OTP</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setNeedsActivation(false)}
                                            className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                                        >
                                            Kembali ke Form Login
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ─── NORMAL LOGIN / REGISTER FORM ─── */
                                <>
                                    {/* Tab Switcher */}
                                    <div className="flex border-b border-slate-100 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => switchTab('login')}
                                            className={`flex-1 pb-3 text-center text-sm font-extrabold transition relative ${
                                                activeTab === 'login'
                                                    ? 'text-red-600'
                                                    : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                        >
                                            Log In (Masuk)
                                            {activeTab === 'login' && (
                                                <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full animate-in fade-in duration-150"></span>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => switchTab('register')}
                                            className={`flex-1 pb-3 text-center text-sm font-extrabold transition relative ${
                                                activeTab === 'register'
                                                    ? 'text-red-600'
                                                    : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                        >
                                            Daftar Akun Baru
                                            {activeTab === 'register' && (
                                                <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full animate-in fade-in duration-150"></span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Checkout Alert Reason */}
                                    {reason === 'checkout' && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-xs font-bold mb-5 flex items-center gap-2">
                                            <ShoppingBag size={16} className="shrink-0" />
                                            <span>Silakan masuk atau daftar terlebih dahulu untuk melanjutkan proses checkout.</span>
                                        </div>
                                    )}

                                    {/* General Error Notice */}
                                    {generalError && (
                                        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-2xl text-xs font-bold mb-5">
                                            {generalError}
                                        </div>
                                    )}

                                    {/* Form Login */}
                                    {activeTab === 'login' ? (
                                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition`}
                                                        placeholder="Masukkan email Anda"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                </div>
                                                {errors.email && <span className="text-[11px] font-bold text-rose-500">{errors.email}</span>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-500' : 'border-slate-200'} rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition`}
                                                        placeholder="Masukkan password Anda"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {errors.password && <span className="text-[11px] font-bold text-rose-500">{errors.password}</span>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50 mt-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Memproses...</span>
                                                    </>
                                                ) : (
                                                    <span>LOG IN</span>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        /* Form Register */
                                        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className={`w-full bg-slate-50 border ${errors.name ? 'border-rose-500' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition`}
                                                        placeholder="Nama sesuai KTP/ID"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                </div>
                                                {errors.name && <span className="text-[11px] font-bold text-rose-500">{errors.name}</span>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Alamat Email</label>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition`}
                                                        placeholder="contoh@email.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                </div>
                                                {errors.email && <span className="text-[11px] font-bold text-rose-500">{errors.email}</span>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">No. WhatsApp</label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        className={`w-full bg-slate-50 border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition`}
                                                        placeholder="Contoh: 081234567890"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                </div>
                                                {errors.phone && <span className="text-[11px] font-bold text-rose-500">{errors.phone}</span>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password Baru</label>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-500' : 'border-slate-200'} rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white transition`}
                                                        placeholder="Minimal 6 karakter"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        disabled={loading}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {errors.password && <span className="text-[11px] font-bold text-rose-500">{errors.password}</span>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50 mt-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Memproses...</span>
                                                    </>
                                                ) : (
                                                    <span>DAFTAR AKUN</span>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            {/* Shopee-style Footer */}
            <footer className="bg-slate-100 border-t border-slate-200 py-8">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center text-xs text-slate-500 space-y-4">
                    <div className="flex flex-wrap justify-center gap-4 font-semibold text-slate-600">
                        <a href="/?page=home" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:text-red-600 transition">Beranda</a>
                        <span>•</span>
                        <a href={getWhatsAppLink(settings, "Halo CS, saya butuh bantuan.")} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition">Pusat Bantuan</a>
                        <span>•</span>
                        <span className="hover:text-red-600 cursor-pointer">Syarat & Ketentuan</span>
                        <span>•</span>
                        <span className="hover:text-red-600 cursor-pointer">Kebijakan Privasi</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-slate-400 font-medium">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Data login Anda dienkripsi aman & tidak dibagikan ke pihak ketiga.</span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                        © {new Date().getFullYear()} {storeName}. Seluruh Hak Cipta Dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
