import React from 'react';
import { MessageSquare, Send, X, Check, CheckCheck, Loader2 } from 'lucide-react';
import useChatWidget from '../hooks/useChatWidget';
import '../../css/chat-widget.css'; // Import external CSS

export default function ChatWidget({ currentUser, onOpenLogin }) {
    const {
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
    } = useChatWidget({ currentUser, onOpenLogin });

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
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
                                ref={inputRef}
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
