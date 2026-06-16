import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Check, CheckCheck, Loader2 } from 'lucide-react';
import { getCsrfToken } from '../utils/helpers';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function ChatWidget({ currentUser, onOpenLogin }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const echoInstanceRef = useRef(null);

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
    }, [currentUser]);

    // Handle marking as read when opening chat window
    useEffect(() => {
        if (isOpen) {
            markAsRead();
            scrollToBottom();
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

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .chat-bubble-btn {
                    width: 56px; height: 56px; border-radius: 50%;
                    background: #c0001a; color: #fff; border: none;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 16px rgba(192, 0, 26, 0.3);
                    cursor: pointer; position: relative; transition: all 0.2s ease;
                }
                .chat-bubble-btn:hover {
                    transform: scale(1.06); background: #a30016;
                }
                .chat-badge {
                    position: absolute; top: -2px; right: -2px;
                    background: #2e7d4a; color: #fff; font-size: 10px;
                    font-weight: 800; width: 20px; height: 20px;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; border: 2px solid #fff;
                }
                .chat-window {
                    position: absolute; bottom: 70px; right: 0;
                    width: 340px; height: 440px; background: #fff;
                    border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                    display: flex; flex-direction: column; overflow: hidden;
                    animation: chat-window-in 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    border: 1px solid #eee;
                }
                @keyframes chat-window-in {
                    from { opacity: 0; transform: translateY(12px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .chat-header {
                    background: #c0001a; color: #fff; padding: 14px 16px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .chat-header-title { font-size: 14px; font-weight: 700; }
                .chat-header-sub { font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 2px; }
                
                .chat-body {
                    flex: 1; padding: 16px; overflow-y: auto;
                    background: #f8f9fa; display: flex; flex-direction: column; gap: 10px;
                }
                .chat-msg-row { display: flex; width: 100%; }
                .chat-msg-row.customer { justify-content: flex-end; }
                .chat-msg-row.admin { justify-content: flex-start; }
                
                .chat-bubble {
                    max-width: 75%; padding: 10px 12px; border-radius: 8px;
                    font-size: 12.5px; line-height: 1.4; position: relative;
                }
                .chat-msg-row.customer .chat-bubble {
                    background: #c0001a; color: #fff;
                    border-bottom-right-radius: 1px;
                }
                .chat-msg-row.admin .chat-bubble {
                    background: #fff; color: #333;
                    border-bottom-left-radius: 1px;
                    border: 1px solid #eef0f2;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                }
                
                .chat-time-status {
                    display: flex; align-items: center; justify-content: flex-end;
                    gap: 3px; font-size: 9px; margin-top: 4px;
                    color: rgba(255,255,255,0.7);
                }
                .chat-msg-row.admin .chat-time-status {
                    color: #999; justify-content: flex-start;
                }
                
                .chat-footer {
                    padding: 12px; border-top: 1px solid #eee;
                    background: #fff;
                }
                .chat-form { display: flex; gap: 8px; }
                .chat-input {
                    flex: 1; border: 1px solid #e0e0e0; border-radius: 20px;
                    padding: 8px 14px; font-size: 13px; outline: none;
                    transition: border-color 0.15s; font-family: inherit;
                }
                .chat-input:focus { border-color: #c0001a; }
                .chat-send-btn {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: #c0001a; color: #fff; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.15s; flex-shrink: 0;
                }
                .chat-send-btn:hover { background: #a30016; }
                .chat-send-btn:disabled { background: #e0e0e0; color: #aaa; cursor: not-allowed; }
            `}</style>

            {/* Chat Window */}
            {isOpen && currentUser && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div>
                            <div className="chat-header-title">Hubungi Kami</div>
                            <div className="chat-header-sub">Putri Jaya Mobil Customer Support</div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-body">
                        {messages.length === 0 ? (
                            <div style={{ margin: 'auto', textAlign: 'center', color: '#888', padding: '0 20px' }}>
                                <MessageSquare size={36} color="#ccc" style={{ marginBottom: 10 }} />
                                <div style={{ fontSize: 13, fontWeight: 600 }}>Halo! Ada yang bisa kami bantu?</div>
                                <div style={{ fontSize: 11, marginTop: 4, color: '#aaa' }}>Ketik pesan Anda di bawah untuk memulai percakapan dengan tim Customer Service kami.</div>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isCustomer = msg.sender_type === 'customer';
                                const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={msg.id || i} className={`chat-msg-row ${isCustomer ? 'customer' : 'admin'}`}>
                                        <div className="chat-bubble">
                                            <div>{msg.message}</div>
                                            <div className="chat-time-status">
                                                <span>{msgTime}</span>
                                                {isCustomer && (
                                                    msg.is_read_by_admin ? <CheckCheck size={11} color="#4ade80" /> : <Check size={11} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer">
                        <form onSubmit={handleSendMessage} className="chat-form">
                            <input 
                                className="chat-input"
                                type="text"
                                placeholder="Tulis pesan..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                disabled={loading}
                                maxLength={1000}
                            />
                            <button 
                                type="submit" 
                                className="chat-send-btn"
                                disabled={!newMessage.trim() || loading}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Bubble Button */}
            <button className="chat-bubble-btn" onClick={handleWidgetClick} title="Chat Customer Service">
                <MessageSquare size={24} />
                {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
            </button>
        </div>
    );
}
