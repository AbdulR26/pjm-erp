import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export function useNotifications(currentUser, navigateTo) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (e) { /* silently fail */ }
    };

    // Fetch notifications on auth check
    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [currentUser]);

    // Polling notifications setiap 30 detik
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleMarkNotificationRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': getCsrfToken() }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { /* silently fail */ }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': getCsrfToken() }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) { /* silently fail */ }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': getCsrfToken() }
            });
            setNotifications(prev => {
                const removed = prev.find(n => n.id === id);
                if (removed && !removed.is_read) setUnreadCount(c => Math.max(0, c - 1));
                return prev.filter(n => n.id !== id);
            });
        } catch (e) { /* silently fail */ }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) handleMarkNotificationRead(notification.id);
        if (notification.link) {
            const params = new URLSearchParams(notification.link.replace('?', ''));
            const page = params.get('page') || 'home';
            const extras = {};
            params.forEach((v, k) => { if (k !== 'page') extras[k] = v; });
            navigateTo(page, extras);
        }
    };

    return {
        notifications,
        unreadCount,
        handleNotificationClick,
        handleMarkAllNotificationsRead,
        handleDeleteNotification
    };
}
