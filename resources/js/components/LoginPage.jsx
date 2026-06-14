import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = '/auth/facebook';
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                if (onLoginSuccess) {
                    onLoginSuccess(data.customer);
                }
            } else {
                if (data.status === 'validation_error') {
                    const errObj = {};
                    Object.keys(data.errors).forEach(key => {
                        errObj[key] = data.errors[key][0];
                    });
                    setErrors(errObj);
                } else {
                    setGeneralError(data.message || 'Login gagal. Periksa kembali email dan password Anda.');
                }
            }
        } catch (err) {
            setGeneralError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json();
            if (response.ok) {
                if (onLoginSuccess) {
                    onLoginSuccess(data.customer);
                }
            } else {
                if (data.status === 'validation_error') {
                    const errObj = {};
                    Object.keys(data.errors).forEach(key => {
                        errObj[key] = data.errors[key][0];
                    });
                    setErrors(errObj);
                } else {
                    setGeneralError(data.message || 'Pendaftaran gagal. Silakan coba lagi.');
                }
            }
        } catch (err) {
            setGeneralError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setErrors({});
        setGeneralError('');
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            animation: 'shopee-page-fadein 0.3s ease',
            fontFamily: "'Inter', sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes shopee-page-fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .spg-wrap { width: 100%; max-width: 440px; }
                .spg-back-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    color: #dc2626; font-size: 13px; font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    background: none; border: none; cursor: pointer;
                    padding: 0; margin-bottom: 20px;
                    transition: opacity 0.15s;
                }
                .spg-back-btn:hover { opacity: 0.75; }

                .spg-card {
                    background: #fff;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
                }

                /* ---- Shopee-style split layout ---- */
                .spg-hero {
                    background: linear-gradient(135deg, #c0001a 0%, #dc2626 55%, #ef4444 100%);
                    padding: 32px 32px 28px;
                    position: relative;
                    overflow: hidden;
                }
                .spg-hero::before {
                    content: '';
                    position: absolute; top: -50px; right: -50px;
                    width: 160px; height: 160px; border-radius: 50%;
                    background: rgba(255,255,255,0.10);
                }
                .spg-hero::after {
                    content: '';
                    position: absolute; bottom: -40px; left: -30px;
                    width: 110px; height: 110px; border-radius: 50%;
                    background: rgba(255,255,255,0.07);
                }
                .spg-hero-content { position: relative; z-index: 5; }
                .spg-brand {
                    font-size: 20px; font-weight: 800; color: #fff;
                    letter-spacing: -0.3px; line-height: 1.1; margin-bottom: 4px;
                }
                .spg-brand span {
                    display: inline-block;
                    background: rgba(255,255,255,0.22);
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-left: 6px;
                    vertical-align: middle;
                }
                .spg-hero-headline {
                    font-size: 24px; font-weight: 800;
                    color: #fff; line-height: 1.2;
                    margin-bottom: 6px;
                }
                .spg-hero-sub {
                    font-size: 12.5px; color: rgba(255,255,255,0.82);
                    font-weight: 500; line-height: 1.4;
                }

                .spg-tabs {
                    display: flex;
                    border-bottom: 1px solid #f0f0f0;
                    background: #fdfdfd;
                }
                .spg-tab-btn {
                    flex: 1;
                    padding: 14px;
                    background: none;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: 'Inter', sans-serif;
                    color: #666;
                    border-bottom: 3px solid transparent;
                    text-align: center;
                }
                .spg-tab-btn:hover {
                    color: #dc2626;
                }
                .spg-tab-btn.active {
                    color: #dc2626;
                    border-bottom-color: #dc2626;
                    font-weight: 700;
                }

                .spg-form { padding: 24px 32px 24px; }
                
                .spg-input-group { margin-bottom: 16px; text-align: left; }
                .spg-label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
                .spg-input-wrapper { position: relative; display: flex; align-items: center; }
                .spg-input-icon { position: absolute; left: 12px; color: #aaa; }
                .spg-input {
                    width: 100%; padding: 11px 14px 11px 38px; border: 1.5px solid #e0e0e0;
                    border-radius: 4px; font-size: 13.5px; font-family: 'Inter', sans-serif;
                    outline: none; transition: all 0.15s; background: #fff;
                }
                .spg-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
                .spg-input.has-error { border-color: #dc2626; }
                .spg-error-text { display: block; font-size: 11px; color: #dc2626; margin-top: 4px; font-weight: 500; }
                
                .spg-alert {
                    background: #fef2f2; border: 1px solid #fee2e2; border-radius: 4px;
                    padding: 10px 12px; color: #b91c1c; font-size: 12.5px;
                    font-weight: 500; margin-bottom: 16px; text-align: left;
                }

                .spg-submit-btn {
                    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
                    background: #dc2626; color: #fff; font-family: 'Inter', sans-serif;
                    font-size: 14px; font-weight: 700; padding: 13px 16px; border-radius: 4px;
                    cursor: pointer; border: none; transition: background 0.15s; margin-top: 8px;
                }
                .spg-submit-btn:hover:not(:disabled) { background: #b91c1c; }
                .spg-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .spg-spinner {
                    width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,0.3);
                    border-top-color: #fff; border-radius: 50%; animation: spg-spin 0.6s linear infinite;
                }
                @keyframes spg-spin { to { transform: rotate(360deg); } }

                .spg-divider {
                    display: flex; align-items: center; gap: 12px;
                    margin: 20px 0 16px;
                }
                .spg-divider-line { flex: 1; height: 1px; background: #eef0f2; }
                .spg-divider-text {
                    font-size: 11px; color: #999; font-weight: 600;
                    text-transform: uppercase; letter-spacing: 0.4px;
                }

                .spg-btn {
                    width: 100%; display: flex; align-items: center;
                    justify-content: center; gap: 10px;
                    padding: 11px 14px; border-radius: 4px;
                    font-size: 13.5px; font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer; border: none; outline: none;
                    transition: all 0.18s ease;
                }
                .spg-btn-google {
                    background: #fff; border: 1.5px solid #e0e0e0; color: #333;
                }
                .spg-btn-google:hover {
                    background: #f7f7f7; border-color: #c0c0c0;
                }
                .spg-btn-facebook { background: #1877F2; color: #fff; }
                .spg-btn-facebook:hover {
                    background: #166FE5;
                }

                .spg-btn-skip {
                    width: 100%; background: transparent;
                    border: 1.5px solid #bbb; color: #666;
                    font-family: 'Inter', sans-serif;
                    font-size: 13px; font-weight: 600;
                    padding: 10px; border-radius: 4px; cursor: pointer;
                    transition: all 0.15s;
                }
                .spg-btn-skip:hover { background: #fafafa; border-color: #888; color: #333; }

                .spg-footer {
                    background: #fafafa; border-top: 1px solid #f0f0f0;
                    padding: 12px 32px;
                    display: flex; align-items: center;
                    justify-content: center; gap: 6px;
                }
                .spg-footer-txt { font-size: 11px; color: #aaa; font-weight: 500; }
            `}</style>

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
