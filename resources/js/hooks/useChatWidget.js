import { useState, useEffect, useRef } from 'react';
import { getCsrfToken } from '../utils/helpers';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function useChatWidget({ currentUser, onOpenLogin }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const echoInstanceRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch message history and count unread
    const fetchChatHistory = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/chats');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                
                // Calculate unread messages from admin
                const unread = data.filter(m => m.sender_type === 'admin' && !m.is_read_by_customer).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Gagal mengambil riwayat chat:", err);
        }
    };

    // Mark messages as read
    const markAsRead = async () => {
        if (!currentUser || !isOpen) return;
        try {
            const res = await fetch('/api/chats/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
            if (res.ok) {
                setUnreadCount(0);
                // Locally mark as read
                setMessages(prev => prev.map(m => {
                    if (m.sender_type === 'admin') {
                        return { ...m, is_read_by_customer: true };
                    }
                    return m;
                }));
            }
        } catch (err) {
            console.error("Gagal menandai pesan dibaca:", err);
        }
    };

    // Initialize Echo WebSocket connection or fallback to polling
    useEffect(() => {
        if (!currentUser) {
            // Reset state if logged out
            setMessages([]);
            setUnreadCount(0);
            return;
        }

        fetchChatHistory();

        // Check if Pusher credentials exist in client-side env
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

        let pollingInterval = null;

        if (pusherKey && pusherCluster) {
            // Setup Laravel Echo with custom auth endpoint
            try {
                window.Pusher = Pusher;
                const echo = new Echo({
                    broadcaster: 'pusher',
                    key: pusherKey,
                    cluster: pusherCluster,
                    forceTLS: true,
                    authEndpoint: '/api/chats/auth',
                    auth: {
                        headers: {
                            'X-CSRF-TOKEN': getCsrfToken()
                        }
                    }
                });

                echoInstanceRef.current = echo;

                // Subscribe to private channel
                echo.private(`chat.customer.${currentUser.id}`)
                    .listen('.MessageSent', (e) => {
                        console.log("Pesan diterima via WebSocket:", e);
                        setMessages(prev => {
                            // Prevent duplicate messages
                            if (prev.some(m => m.id === e.id)) return prev;
                            return [...prev, e];
                        });

                        if (e.sender_type === 'admin') {
                            if (isOpen) {
                                // Mark as read immediately if window is open
                                markAsRead();
                            } else {
                                setUnreadCount(count => count + 1);
                            }
                        }
                    });
            } catch (err) {
                console.error("Pusher Echo init failed, falling back to polling", err);
                // Fallback polling if Echo setup fails
                pollingInterval = setInterval(fetchChatHistory, 5000);
            }
        } else {
            console.log("Pusher key tidak ditemukan, menggunakan polling HTTP (Opsi 1)");
            // Fallback HTTP polling
            pollingInterval = setInterval(fetchChatHistory, 5000);
        }

        return () => {
            if (echoInstanceRef.current && currentUser) {
                echoInstanceRef.current.leave(`chat.customer.${currentUser.id}`);
            }
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [currentUser, isOpen]); // added isOpen dependency to ensure markAsRead behaves correctly when state changes

    // Listen to custom trigger event to open chat widget and pre-fill message
    useEffect(() => {
        const handleTriggerChat = (e) => {
            if (!currentUser) {
                if (onOpenLogin) {
                    onOpenLogin("Silakan login terlebih dahulu untuk chat dengan Customer Service kami.");
                } else {
                    alert("Silakan login terlebih dahulu untuk melakukan chat.");
                }
                return;
            }
            setIsOpen(true);
            if (e.detail && e.detail.message) {
                setNewMessage(e.detail.message);
            }
        };

        window.addEventListener('trigger-live-chat', handleTriggerChat);
        return () => {
            window.removeEventListener('trigger-live-chat', handleTriggerChat);
        };
    }, [currentUser, onOpenLogin]);

    // Handle marking as read when opening chat window
    useEffect(() => {
        if (isOpen) {
            markAsRead();
            scrollToBottom();
            // Focus the input field after render
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ message: newMessage })
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage('');
            } else {
                const data = await res.json();
                alert(data.message || 'Gagal mengirim pesan');
            }
        } catch (err) {
            console.error("Gagal mengirim pesan:", err);
            alert("Kesalahan jaringan saat mengirim pesan.");
        } finally {
            setLoading(false);
        }
    };

    const handleWidgetClick = () => {
        if (!currentUser) {
            if (onOpenLogin) {
                onOpenLogin("Silakan login terlebih dahulu untuk chat dengan Customer Service kami.");
            } else {
                alert("Silakan login terlebih dahulu untuk melakukan chat.");
            }
            return;
        }
        setIsOpen(!isOpen);
    };

    return {
        isOpen,
        setIsOpen,
        messages,
        newMessage,
        setNewMessage,
        loading,
        unreadCount,
        messagesEndRef,
        inputRef,
        handleSendMessage,
        handleWidgetClick
    };
}
