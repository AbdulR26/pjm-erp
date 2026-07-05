import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export function useAuth(initialPage) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loginReason, setLoginReason] = useState('');
    const [authChecked, setAuthChecked] = useState(false);
    
    // Auth checking is usually handled by the main fetch in App.jsx.
    // So we just expose the state and setters, plus logout.

    const handleLogout = async (navigateToHome) => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': getCsrfToken() } });
        } catch (e) { /* silently fail */ }
        setCurrentUser(null);
        navigateToHome();
    };

    const handleGoToLoginPage = (reason = '', navigateTo, setIsCartOpen) => {
        setLoginReason(reason);
        navigateTo('login');
        if (setIsCartOpen) setIsCartOpen(false);
    };

    return {
        currentUser,
        setCurrentUser,
        loginReason,
        setLoginReason,
        authChecked,
        setAuthChecked,
        handleLogout,
        handleGoToLoginPage
    };
}
