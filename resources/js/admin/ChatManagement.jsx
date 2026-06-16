import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { MessageSquare, Send, User, Search, Check, CheckCheck, Loader2, Phone, Mail } from 'lucide-react';

export default function ChatManagement() {
    const [threads, setThreads] = useState([]);
    const [activeCustomer, setActiveCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingSend, setLoadingSend] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingThreads, setLoadingThreads] = useState(false);
    
    const messagesEndRef = useRef(null);
    const echoInstanceRef = useRef(null);
    const activeCustomerRef = useRef(null);

    // Sync activeCustomer state to ref for callback use
    useEffect(() => {
        activeCustomerRef.current = activeCustomer;
    }, [activeCustomer]);

    // Play a soft notification beep sound using Web Audio API (self-contained)
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
            
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
                gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.18);
            }, 100);
        } catch (e) {
            console.warn("Gagal memutar suara notifikasi:", e);
        }
    };

    // Fetch list of customer chat threads
    const fetchThreads = async (showLoading = false) => {
        if (showLoading) setLoadingThreads(true);
        try {
            const res = await axios.get('/adminv1/api/chats');
            setThreads(res.data);
        } catch (err) {
            console.error("Gagal mengambil data thread chat:", err);
        } finally {
            if (showLoading) setLoadingThreads(false);
        }
    };

    // Fetch full history with active customer and clear unread badge
    const fetchChatHistory = async (customerId) => {
        setLoadingHistory(true);
        try {
            const res = await axios.get(`/adminv1/api/chats/${customerId}`);
            setMessages(res.data);
            
            // Mark as read in backend
            await axios.post(`/adminv1/api/chats/${customerId}/read`);
            
            // Locally update unread count for this thread
            setThreads(prev => prev.map(t => {
                if (t.id === customerId) {
                    return { ...t, unread_count: 0 };
                }
                return t;
            }));
        } catch (err) {
            console.error("Gagal memuat riwayat chat:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Initialize Echo WebSocket connection or fallback to polling
    useEffect(() => {
        fetchThreads(true);

        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

        let pollingInterval = null;

        if (pusherKey && pusherCluster) {
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
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        }
                    }
                });

                echoInstanceRef.current = echo;

                // Subscribe to private channel to listen for all messages
                echo.private('admin.chats')
                    .listen('.MessageSent', (e) => {
                        console.log("Admin menerima pesan via WebSocket:", e);
                        
                        const activeCust = activeCustomerRef.current;

                        // Sound notification if message is from customer
                        if (e.sender_type === 'customer') {
                            // Check if message is for the current active chat thread
                            if (!activeCust || activeCust.id !== e.customer_id) {
                                playNotificationSound();
                            }
                        }

                        // If active customer thread is open, append message
                        if (activeCust && activeCust.id === e.customer_id) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === e.id)) return prev;
                                return [...prev, e];
                            });

                            // Auto read on backend
                            if (e.sender_type === 'customer') {
                                axios.post(`/adminv1/api/chats/${activeCust.id}/read`);
                            }
                        }

                        // Refresh threads list to update last message and sorting
                        setThreads(prev => {
                            const threadExists = prev.some(t => t.id === e.customer_id);
                            
                            if (threadExists) {
                                return prev.map(t => {
                                    if (t.id === e.customer_id) {
                                        return {
                                            ...t,
                                            last_message: e.message,
                                            last_message_time: e.created_at,
                                            unread_count: (activeCust && activeCust.id === e.customer_id) || e.sender_type === 'admin'
                                                ? t.unread_count
                                                : (t.unread_count || 0) + 1
                                        };
                                    }
                                    return t;
                                }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
                            } else {
                                // Fetch customer profile and insert thread if it's new
                                fetchThreads();
                                return prev;
                            }
                        });
                    });
            } catch (err) {
                console.error("Echo init failed in admin, falling back to polling", err);
                pollingInterval = setInterval(() => {
                    fetchThreads();
                    if (activeCustomerRef.current) {
                        // Refresh active chat
                        axios.get(`/adminv1/api/chats/${activeCustomerRef.current.id}`).then(res => setMessages(res.data));
                    }
                }, 5000);
            }
        } else {
            console.log("Pusher tidak terkonfigurasi, menggunakan polling HTTP (Opsi 1)");
            pollingInterval = setInterval(() => {
                fetchThreads();
                if (activeCustomerRef.current) {
                    axios.get(`/adminv1/api/chats/${activeCustomerRef.current.id}`).then(res => setMessages(res.data));
                }
            }, 5000);
        }

        return () => {
            if (echoInstanceRef.current) {
                echoInstanceRef.current.leave('admin.chats');
            }
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, []);

    // Handle selecting a customer thread
    const handleSelectThread = (customer) => {
        setActiveCustomer(customer);
        fetchChatHistory(customer.id);
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeCustomer || loadingSend) return;

        setLoadingSend(true);
        try {
            const res = await axios.post(`/adminv1/api/chats/${activeCustomer.id}`, {
                message: newMessage
            });
            
            if (res.status === 201) {
                const sentMsg = res.data;
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage('');
                
                // Update last message in local sidebar list
                setThreads(prev => prev.map(t => {
                    if (t.id === activeCustomer.id) {
                        return {
                            ...t,
                            last_message: sentMsg.message,
                            last_message_time: sentMsg.created_at
                        };
                    }
                    return t;
                }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time)));
            }
        } catch (err) {
            console.error("Gagal mengirim pesan:", err);
            Swal.fire('Error', 'Gagal mengirim pesan. Silakan coba lagi.', 'error');
        } finally {
            setLoadingSend(false);
        }
    };

    // Filter threads by search query
    const filteredThreads = threads.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const d = new Date(timeStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[78vh] bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-sm">CS</div>
                    <div>
                        <h3 className="text-sm font-black tracking-wider uppercase">Live Chat Pelanggan</h3>
                        <p className="text-[10px] text-slate-400 font-bold -mt-0.5">Sistem Customer Support - Putri Jaya Mobil</p>
                    </div>
                </div>
                {loadingThreads && <Loader2 size={16} className="text-red-500 animate-spin" />}
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* LEFT COLUMN: Customer Threads */}
                <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-slate-100/60 shrink-0">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <Search size={14} />
                            </span>
                            <input 
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500 transition"
                                type="text"
                                placeholder="Cari pelanggan..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Threads List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 p-2 space-y-1">
                        {filteredThreads.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 py-10 font-bold">
                                {searchQuery ? 'Pelanggan tidak ditemukan' : 'Tidak ada riwayat obrolan'}
                            </div>
                        ) : (
                            filteredThreads.map((thread) => {
                                const isActive = activeCustomer && activeCustomer.id === thread.id;
                                return (
                                    <button
                                        key={thread.id}
                                        onClick={() => handleSelectThread(thread)}
                                        className={`w-full p-3 rounded-xl text-left flex items-start space-x-3 transition cursor-pointer select-none border-none outline-none ${
                                            isActive 
                                                ? 'bg-slate-900 text-white shadow-md' 
                                                : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                            isActive ? 'bg-red-600 text-white font-extrabold' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {thread.avatar ? (
                                                <img src={thread.avatar} alt="" className="h-full w-full object-cover rounded-full" />
                                            ) : (
                                                thread.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>

                                        {/* Info preview */}
                                        <div className="grow min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-xs font-black truncate leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                                    {thread.name}
                                                </h4>
                                                <span className={`text-[9px] font-semibold shrink-0 ml-1 ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    {formatTime(thread.last_message_time)}
                                                </span>
                                            </div>
                                            <p className={`text-[10px] font-semibold truncate mt-1 leading-snug ${isActive ? 'text-slate-350' : 'text-slate-400'}`}>
                                                {thread.last_message || '—'}
                                            </p>
                                        </div>

                                        {/* Unread badge */}
                                        {thread.unread_count > 0 && !isActive && (
                                            <span className="h-4.5 min-w-4.5 px-1 bg-emerald-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                                                {thread.unread_count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Active Chat Window */}
                <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
                    {!activeCustomer ? (
                        <div className="m-auto text-center space-y-3 p-8 animate-in fade-in duration-300">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
                                <MessageSquare size={26} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Pilih Obrolan Pelanggan</h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1">Pilih salah satu percakapan di bilah kiri untuk membalas pertanyaan pelanggan.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {/* Active Chat Header */}
                            <div className="bg-white px-6 py-3 border-b border-slate-150/60 flex items-center justify-between shrink-0 shadow-xs">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="h-9 w-9 rounded-full bg-red-50 text-red-600 font-black flex items-center justify-center text-xs">
                                        {activeCustomer.avatar ? (
                                            <img src={activeCustomer.avatar} alt="" className="h-full w-full object-cover rounded-full" />
                                        ) : (
                                            activeCustomer.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black text-slate-800 leading-tight">{activeCustomer.name}</h4>
                                        <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-400 mt-1">
                                            {activeCustomer.email && (
                                                <span className="flex items-center gap-0.5"><Mail size={10} /> {activeCustomer.email}</span>
                                            )}
                                            {activeCustomer.phone && (
                                                <span className="flex items-center gap-0.5"><Phone size={10} /> {activeCustomer.phone}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {loadingHistory ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 size={24} className="text-slate-400 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-xs text-slate-400 font-semibold py-12">
                                        Memulai percakapan baru dengan pelanggan...
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isAdmin = msg.sender_type === 'admin';
                                        const msgTime = formatTime(msg.created_at);
                                        return (
                                            <div key={msg.id || i} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-xl px-4 py-2.5 shadow-xs text-xs font-semibold relative ${
                                                    isAdmin 
                                                        ? 'bg-slate-900 text-white rounded-br-none' 
                                                        : 'bg-white text-slate-700 border border-slate-150/60 rounded-bl-none'
                                                }`}>
                                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    <div className={`flex items-center gap-1 mt-1.5 justify-end text-[9px] ${
                                                        isAdmin ? 'text-slate-400' : 'text-slate-450'
                                                    }`}>
                                                        <span>{msgTime}</span>
                                                        {isAdmin && (
                                                            msg.is_read_by_customer 
                                                                ? <CheckCheck size={11} className="text-emerald-400 stroke-3" />
                                                                : <Check size={11} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Form Panel */}
                            <div className="bg-white p-4 border-t border-slate-150/60 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <textarea 
                                        className="grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-500 transition resize-none h-12"
                                        placeholder="Ketik pesan balasan..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        disabled={loadingSend}
                                        maxLength={1000}
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-red-600 hover:bg-red-500 text-white p-3.5 rounded-xl shadow-md hover:shadow-red-500/15 flex items-center justify-center transition shrink-0 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                        disabled={!newMessage.trim() || loadingSend}
                                    >
                                        {loadingSend ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
