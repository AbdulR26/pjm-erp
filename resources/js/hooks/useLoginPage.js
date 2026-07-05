import { useState } from 'react';
import { getCsrfToken } from '../utils/helpers';

export default function useLoginPage(onLoginSuccess) {
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
                    'X-CSRF-TOKEN': getCsrfToken()
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

    return {
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
    };
}
