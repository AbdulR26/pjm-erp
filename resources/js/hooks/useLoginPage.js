import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export default function useLoginPage(onLoginSuccess) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    // OTP Activation State
    const [needsActivation, setNeedsActivation] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [countdown, setCountdown] = useState(60); // 60 seconds countdown

    // Countdown Timer Effect
    useEffect(() => {
        let timer;
        if (needsActivation && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [needsActivation, countdown]);

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
        setOtpError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                if (onLoginSuccess) {
                    onLoginSuccess(data.customer);
                }
            } else {
                if (data.needs_activation) {
                    setNeedsActivation(true);
                    setUnverifiedEmail(data.email || email);
                    setCountdown(60);
                    setGeneralError(data.message || 'Akun Anda belum diaktivasi. Masukkan kode OTP.');
                } else if (data.status === 'validation_error') {
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
        setOtpError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json();
            if (response.ok || data.needs_activation) {
                setNeedsActivation(true);
                setUnverifiedEmail(data.email || email);
                setCountdown(60);
                setResendMessage(data.message || 'Pendaftaran berhasil. Silakan cek email Anda untuk kode OTP.');
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

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            const pastedDigits = value.slice(0, 6).split('');
            const newDigits = [...otpDigits];
            pastedDigits.forEach((digit, i) => {
                if (i < 6) newDigits[i] = digit;
            });
            setOtpDigits(newDigits);
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);
    };

    const handleVerifyOtpSubmit = async (e) => {
        if (e) e.preventDefault();
        const code = otpDigits.join('');
        if (code.length !== 6) {
            setOtpError('Kode OTP harus 6 digit angka.');
            return;
        }

        setLoading(true);
        setOtpError('');
        setResendMessage('');

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ email: unverifiedEmail || email, otp_code: code })
            });

            const data = await response.json();
            if (response.ok) {
                if (onLoginSuccess) {
                    onLoginSuccess(data.customer);
                }
            } else {
                setOtpError(data.message || 'Verifikasi OTP gagal. Silakan coba lagi.');
            }
        } catch (err) {
            setOtpError('Terjadi kesalahan jaringan saat verifikasi OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return; // Block resend if countdown timer is still active

        setLoading(true);
        setOtpError('');
        setResendMessage('');

        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ email: unverifiedEmail || email })
            });

            const data = await response.json();
            if (response.ok) {
                setResendMessage(data.message || 'Kode OTP baru berhasil dikirimkan ke email Anda.');
                setOtpDigits(['', '', '', '', '', '']);
                setCountdown(60); // Restart 60s countdown timer
            } else {
                setOtpError(data.message || 'Gagal mengirim ulang OTP.');
            }
        } catch (err) {
            setOtpError('Terjadi kesalahan jaringan saat meminta ulang OTP.');
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setErrors({});
        setGeneralError('');
        setNeedsActivation(false);
        setOtpError('');
        setResendMessage('');
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setOtpDigits(['', '', '', '', '', '']);
        setCountdown(60);
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
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
        handleGoogleLogin,
        handleFacebookLogin,
        handleLoginSubmit,
        handleRegisterSubmit,
        handleOtpChange,
        handleVerifyOtpSubmit,
        handleResendOtp,
        switchTab
    };
}
