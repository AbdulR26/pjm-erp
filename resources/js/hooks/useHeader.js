import { useState, useRef, useEffect } from 'react';

export function timeAgo(dateString, t, language) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t('header.time_just_now');
    if (diffMin < 60) return t('header.time_minutes_ago', { count: diffMin });
    if (diffHour < 24) return t('header.time_hours_ago', { count: diffHour });
    if (diffDay < 7) return t('header.time_days_ago', { count: diffDay });
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function useHeader({ searchQuery, setSearchQuery, language, t }) {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langRef = useRef(null);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery || '');

    useEffect(() => {
        setLocalQuery(searchQuery || '');
    }, [searchQuery]);

    const handleSearchSubmit = () => {
        setSearchQuery(localQuery);
    };

    // Close language dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close notifications dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatNotificationTime = (dateString) => {
        return timeAgo(dateString, t, language);
    };

    return {
        isNotifOpen,
        setIsNotifOpen,
        notifRef,
        isLangOpen,
        setIsLangOpen,
        langRef,
        showCartDropdown,
        setShowCartDropdown,
        localQuery,
        setLocalQuery,
        handleSearchSubmit,
        formatNotificationTime
    };
}
