import React from 'react';
import { ShieldCheck, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import useLoginPage from '../hooks/useLoginPage';
import '../../css/login.css'; // Import external CSS

// Google Icon SVG
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// Facebook Icon SVG
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

export default function LoginPage({ onBack, reason, onLoginSuccess }) {
    const {
        activeTab,
        loading,
        errors,
        generalError,
        name, setName,
        email, setEmail,
        phone, setPhone,
        password, setPassword,
        handleGoogleLogin,
        handleFacebookLogin,
        handleLoginSubmit,
        handleRegisterSubmit,
        switchTab
    } = useLoginPage(onLoginSuccess);

    return (
        <div className="spg-page-container">
            <div className="spg-wrap">
                {/* Back Button */}
                <button className="spg-back-btn" onClick={onBack}>
                    <ArrowLeft size={14} />
                    <span>Kembali Belanja</span>
                </button>

                <div className="spg-card">
                    {/* Hero Section */}
                    <div className="spg-hero">
                        <div className="spg-hero-content">
                            <div className="spg-brand">
                                Putri Jaya Mobil
                                <span>Official</span>
                            </div>
                            <div className="spg-hero-headline">
                                {reason === 'checkout'
                                    ? 'Selesaikan Pembelian Anda'
                                    : 'Selamat Datang'}
                            </div>
                            <p className="spg-hero-sub">
                                {reason === 'checkout'
                                    ? 'Silakan masuk atau daftar untuk melanjutkan proses checkout yang aman.'
                                    : 'Nikmati kemudahan berbelanja suku cadang dan aksesoris mobil premium.'}
                            </p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="spg-tabs">
                        <button
                            className={`spg-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => switchTab('login')}
                        >
                            Masuk (Login)
                        </button>
                        <button
                            className={`spg-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => switchTab('register')}
                        >
                            Daftar Akun Baru
                        </button>
                    </div>

                    {/* Form Section */}
                    <div className="spg-form">
                        {generalError && (
                            <div className="spg-alert">
                                {generalError}
                            </div>
                        )}

                        {activeTab === 'login' ? (
                            <form onSubmit={handleLoginSubmit}>
                                {/* Email */}
                                <div className="spg-input-group">
                                    <label className="spg-label">Alamat Email</label>
                                    <div className="spg-input-wrapper">
                                        <Mail size={16} className="spg-input-icon" />
                                        <input
                                            type="email"
                                            className={`spg-input ${errors.email ? 'has-error' : ''}`}
                                            placeholder="Masukkan email Anda"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {errors.email && <span className="spg-error-text">{errors.email}</span>}
                                </div>

                                {/* Password */}
                                <div className="spg-input-group">
                                    <label className="spg-label">Password</label>
                                    <div className="spg-input-wrapper">
                                        <Lock size={16} className="spg-input-icon" />
                                        <input
                                            type="password"
                                            className={`spg-input ${errors.password ? 'has-error' : ''}`}
                                            placeholder="Masukkan password Anda"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {errors.password && <span className="spg-error-text">{errors.password}</span>}
                                </div>

                                <button type="submit" className="spg-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="spg-spinner" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <span>Masuk Sekarang</span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegisterSubmit}>
                                {/* Nama Lengkap */}
                                <div className="spg-input-group">
                                    <label className="spg-label">Nama Lengkap</label>
                                    <div className="spg-input-wrapper">
                                        <User size={16} className="spg-input-icon" />
                                        <input
                                            type="text"
                                            className={`spg-input ${errors.name ? 'has-error' : ''}`}
                                            placeholder="Masukkan nama lengkap Anda"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {errors.name && <span className="spg-error-text">{errors.name}</span>}
                                </div>

                                {/* Email */}
                                <div className="spg-input-group">
                                    <label className="spg-label">Alamat Email</label>
                                    <div className="spg-input-wrapper">
                                        <Mail size={16} className="spg-input-icon" />
                                        <input
                                            type="email"
                                            className={`spg-input ${errors.email ? 'has-error' : ''}`}
                                            placeholder="contoh@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {errors.email && <span className="spg-error-text">{errors.email}</span>}
                                </div>

                                {/* WhatsApp/No. Telp */}
                                <div className="spg-input-group">
                                    <label className="spg-label">Nomor WhatsApp</label>
                                    <div className="spg-input-wrapper">
                                        <Phone size={16} className="spg-input-icon" />
                                        <input
                                            type="tel"
                                            className={`spg-input ${errors.phone ? 'has-error' : ''}`}
                                            placeholder="Contoh: 081234567890"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {errors.phone && <span className="spg-error-text">{errors.phone}</span>}
                                </div>

                                {/* Password */}
                                <div className="spg-input-group">
                                    <label className="spg-label">Password (Min. 6 Karakter)</label>
                                    <div className="spg-input-wrapper">
                                        <Lock size={16} className="spg-input-icon" />
                                        <input
                                            type="password"
                                            className={`spg-input ${errors.password ? 'has-error' : ''}`}
                                            placeholder="Buat password baru"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    {errors.password && <span className="spg-error-text">{errors.password}</span>}
                                </div>

                                <button type="submit" className="spg-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="spg-spinner" />
                                            <span>Mendaftar...</span>
                                        </>
                                    ) : (
                                        <span>Daftar Akun Baru</span>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Divider */}
                        <div className="spg-divider">
                            <div className="spg-divider-line" />
                            <span className="spg-divider-text">atau masuk dengan</span>
                            <div className="spg-divider-line" />
                        </div>

                        {/* Social Media Login */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                            {/* Google */}
                            <button type="button" className="spg-btn spg-btn-google" onClick={handleGoogleLogin}>
                                <GoogleIcon />
                                <span>Google</span>
                            </button>

                            {/* Facebook */}
                            <button type="button" className="spg-btn spg-btn-facebook" onClick={handleFacebookLogin}>
                                <FacebookIcon />
                                <span>Facebook</span>
                            </button>
                        </div>

                        {/* Skip */}
                        <button className="spg-btn-skip" onClick={onBack}>
                            Lanjut Belanja Tanpa Login
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="spg-footer">
                        <ShieldCheck size={12} color="#52c41a" />
                        <span className="spg-footer-txt">Data Anda aman & tidak akan dibagikan ke pihak ketiga</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
