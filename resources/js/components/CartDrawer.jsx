import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Lock } from 'lucide-react';

export default function CartDrawer({ 
    isOpen, 
    onClose, 
    cartItems, 
    onUpdateQty, 
    onRemoveItem, 
    onCheckout 
}) {
    if (!isOpen) return null;

    const totalPrice = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity, 
        0
    );

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-100 animate-in slide-in-from-right duration-300">
                    
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                        <div className="flex items-center space-x-2.5">
                            <ShoppingBag size={20} />
                            <h3 className="text-base font-extrabold tracking-wide">
                                Keranjang Belanja ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)})
                            </h3>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Cart Content */}
                    <div className="flex-1 py-4 overflow-y-auto px-6">
                        {cartItems.length === 0 ? (
                            // Empty State
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag size={28} />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">Keranjang Anda Kosong</h4>
                                <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                                    Pilih berbagai produk otomotif premium dan aksesoris terbaik dari kami untuk dipajang di sini.
                                </p>
                                <button 
                                    onClick={onClose}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition duration-200 cursor-pointer shadow-md"
                                >
                                    Mulai Belanja
                                </button>
                            </div>
                        ) : (
                            // Items list
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div 
                                        key={`${item.product.id}-${item.variant}`}
                                        className="flex items-start py-4 border-b border-slate-100 last:border-0"
                                    >
                                        {/* Product Image */}
                                        <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="ml-4 flex-1 flex flex-col justify-between h-full">
                                            <div>
                                                <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                                                    {item.product.name}
                                                </h4>
                                                {item.variant && (
                                                    <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 uppercase">
                                                        Varian: {item.variant}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price and Quantity controls */}
                                            <div className="flex justify-between items-center mt-3">
                                                <div className="flex items-center border border-slate-200 rounded bg-slate-50 text-xs">
                                                    <button
                                                        onClick={() => onUpdateQty(item.product.id, item.variant, item.quantity - 1)}
                                                        className="p-1 hover:text-slate-900 text-slate-400 cursor-pointer"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="px-2 font-bold text-slate-800 w-6 text-center select-none">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => onUpdateQty(item.product.id, item.variant, item.quantity + 1)}
                                                        className="p-1 hover:text-slate-900 text-slate-400 cursor-pointer"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>

                                                <span className="text-xs md:text-sm font-extrabold text-blue-700">
                                                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => onRemoveItem(item.product.id, item.variant)}
                                            className="ml-4 text-slate-300 hover:text-rose-500 transition p-1 cursor-pointer"
                                            title="Hapus Produk"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Summary Section */}
                    {cartItems.length > 0 && (
                        <div className="px-6 py-6 bg-slate-50 border-t border-slate-100">
                            {/* Calculation */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                    <span>Subtotal Produk</span>
                                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                                    <span>Diskon Belanja</span>
                                    <span className="text-rose-600">- Rp 0</span>
                                </div>
                                <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-2 border-t border-slate-200">
                                    <span>Total Pembayaran</span>
                                    <span className="text-blue-700 text-base">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={onCheckout}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                    <span>Simulasi Checkout Sekarang</span>
                                </button>
                                <a
                                    href={`https://wa.me/6281234567890?text=Halo%20Putri%20Jaya%20Mobil,%20saya%20ingin%20memesan%20barang-barang%20ini:%20${encodeURIComponent(
                                        cartItems
                                            .map((item) => `- ${item.product.name} (${item.variant}) x${item.quantity}`)
                                            .join('\n')
                                    )}\n\nTotal:%20Rp%20${totalPrice.toLocaleString('id-ID')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center space-x-2 text-center shadow-lg hover:shadow-emerald-500/10"
                                >
                                    <span>Order Via WhatsApp</span>
                                </a>
                            </div>

                            <div className="flex items-center justify-center space-x-1 mt-4 text-[10px] text-slate-400 font-medium">
                                <Lock size={12} className="text-slate-300" />
                                <span>Pembayaran Terenkripsi & Layanan Terpercaya</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
