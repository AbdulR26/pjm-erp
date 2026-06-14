import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

// Google Icon SVG
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// Facebook Icon SVG
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

export default function LoginModal({ onClose }) {
    const [hoveredBtn, setHoveredBtn] = useState(null);

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = '/auth/facebook';
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(4px)',
                animation: 'shopee-fadein 0.2s ease',
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes shopee-fadein { from { opacity: 0; } to { opacity: 1; } }
                @keyframes shopee-slidein { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes shopee-shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shopee-modal-card {
                    font-family: 'Inter', sans-serif;
                    background: #fff;
                    border-radius: 6px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.22);
                    overflow: hidden;
                    animation: shopee-slidein 0.25s cubic-bezier(0.34,1.56,0.64,1);
                }
                .shopee-header {
                    background: linear-gradient(135deg, #c0001a 0%, #dc2626 55%, #ef4444 100%);
                    padding: 32px 28px 28px;
                    position: relative;
                    overflow: hidden;
                }
                .shopee-header::before {
                    content: '';
                    position: absolute;
                    top: -40px; right: -40px;
                    width: 130px; height: 130px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.10);
                }
                .shopee-header::after {
                    content: '';
                    position: absolute;
                    bottom: -30px; left: -20px;
                    width: 90px; height: 90px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.07);
                }
                .shopee-logo-text {
                    font-size: 26px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.5px;
                    line-height: 1;
                }
                .shopee-logo-dot {
                    display: inline-block;
                    width: 8px; height: 8px;
                    background: #fff;
                    border-radius: 50%;
                    margin-left: 2px;
                    vertical-align: super;
                    font-size: 8px;
                }
                .shopee-tagline {
                    color: rgba(255,255,255,0.85);
                    font-size: 13px;
                    margin-top: 4px;
                    font-weight: 500;
                }
                .shopee-body { padding: 28px; }
                .shopee-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: #222;
                    margin-bottom: 6px;
                }
                .shopee-subtitle {
                    font-size: 12.5px;
                    color: #888;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }
                .shopee-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 13px 16px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    border: none;
                    transition: all 0.18s ease;
                    margin-bottom: 12px;
                    outline: none;
                }
                .shopee-btn-google {
                    background: #fff;
                    border: 1.5px solid #e0e0e0;
                    color: #333;
                }
                .shopee-btn-google:hover {
                    background: #f7f7f7;
                    border-color: #c8c8c8;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
                }
                .shopee-btn-facebook {
                    background: #1877F2;
                    color: #fff;
                }
                .shopee-btn-facebook:hover {
                    background: #166FE5;
                    box-shadow: 0 2px 12px rgba(24,119,242,0.30);
                }
                .shopee-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 16px 0;
                }
                .shopee-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #f0f0f0;
                }
                .shopee-divider-text {
                    font-size: 11px;
                    color: #bbb;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .shopee-btn-skip {
                    width: 100%;
                    background: transparent;
                    border: 1.5px solid #dc2626;
                    color: #dc2626;
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 11px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.18s ease;
                }
                .shopee-btn-skip:hover {
                    background: #fff1f2;
                }
                .shopee-footer {
                    background: #fafafa;
                    border-top: 1px solid #f0f0f0;
                    padding: 12px 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .shopee-footer-text {
                    font-size: 11px;
                    color: #aaa;
                    font-weight: 500;
                }
                .shopee-close-btn {
                    position: absolute;
                    top: 12px; right: 12px;
                    background: rgba(255,255,255,0.18);
                    border: none;
                    border-radius: 50%;
                    width: 28px; height: 28px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    color: #fff;
                    transition: background 0.15s;
                    z-index: 10;
                }
                .shopee-close-btn:hover { background: rgba(255,255,255,0.30); }
            `}</style>

            <div className="shopee-modal-card">
                {/* Header */}
                <div className="shopee-header">
                    <button className="shopee-close-btn" onClick={onClose}>
                        <X size={15} />
                    </button>
                    <div style={{ position: 'relative', zIndex: 5 }}>
                        <div className="shopee-logo-text">
                            Putri Jaya Mobil
                        </div>
                        <p className="shopee-tagline">Login untuk melanjutkan belanja</p>
                    </div>
                </div>

                {/* Body */}
                <div className="shopee-body">
                    <p className="shopee-title">Masuk ke Akun Anda</p>
                    <p className="shopee-subtitle">
                        Pilih metode login untuk melanjutkan checkout dengan aman
                    </p>

                    {/* Google Button */}
                    <button
                        className="shopee-btn shopee-btn-google"
                        onClick={handleGoogleLogin}
                    >
                        <GoogleIcon />
                        <span>Lanjutkan dengan Google</span>
                    </button>

                    {/* Facebook Button */}
                    <button
                        className="shopee-btn shopee-btn-facebook"
                        onClick={handleFacebookLogin}
                    >
                        <FacebookIcon />
                        <span>Lanjutkan dengan Facebook</span>
                    </button>

                    {/* Divider */}
                    <div className="shopee-divider">
                        <div className="shopee-divider-line" />
                        <span className="shopee-divider-text">atau</span>
                        <div className="shopee-divider-line" />
                    </div>

                    {/* Skip Button */}
                    <button className="shopee-btn-skip" onClick={onClose}>
                        Lanjut Belanja Tanpa Login
                    </button>
                </div>

                {/* Footer */}
                <div className="shopee-footer">
                    <ShieldCheck size={12} color="#52c41a" />
                    <span className="shopee-footer-text">Data Anda aman & tidak akan dibagikan ke pihak ketiga</span>
                </div>
            </div>
        </div>
    );
}
