import React, { useState } from 'react';
import { ArrowLeft, MapPin, Truck, ShieldCheck, Wallet, ChevronRight, Check, X, Copy, QrCode, CreditCard } from 'lucide-react';

const COURIERS = [
    { id: 'jnt', name: 'J&T Express', service: 'Reguler', price: 12000, logo: '🔴' },
    { id: 'jne', name: 'JNE Express', service: 'Reguler', price: 15000, logo: '🔵' },
    { id: 'sicepat', name: 'SiCepat Halu', service: 'Hemat', price: 9000, logo: '🔴' },
    { id: 'pjm_instant', name: 'PJM Instant Kurir', service: 'Instant (Surabaya)', price: 25000, logo: '🚗' }
];

export default function CheckoutPage({ cart, onBack, onOrderSuccess }) {
    const [selectedCourier, setSelectedCourier] = useState(COURIERS[0]);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState({
        name: 'Abdul Rohman',
        phone: '0812-3456-7890',
        detail: 'Jl. Diponegoro No. 123, Kel. Darmo, Kec. Wonokromo, Kota Surabaya, Jawa Timur, 60241'
    });
    const [tempAddress, setTempAddress] = useState({ ...address });

    // Midtrans Snap Simulator State
    const [showMidtrans, setShowMidtrans] = useState(false);
    const [midtransStep, setMidtransStep] = useState('select_method'); // 'select_method', 'gopay', 'va', 'cc', 'success'
    const [selectedBank, setSelectedBank] = useState('');
    const [copied, setCopied] = useState(false);

    const subtotalProducts = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const shippingFee = selectedCourier.price;
    const totalPayment = subtotalProducts + shippingFee;

    const handleSaveAddress = (e) => {
        e.preventDefault();
        setAddress({ ...tempAddress });
        setIsEditingAddress(false);
    };

    const handlePlaceOrder = () => {
        setShowMidtrans(true);
        setMidtransStep('select_method');
    };

    const handleCopyVA = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSimulatePayment = () => {
        setMidtransStep('success');
        setTimeout(() => {
            setShowMidtrans(false);
            onOrderSuccess({
                address,
                items: cart,
                courier: selectedCourier,
                subtotal: subtotalProducts,
                shipping: shippingFee,
                total: totalPayment,
                paymentMethod: 'Midtrans VA/QRIS'
            });
        }, 2500);
    };

    return (
        <div className="space-y-4 py-4 animate-in fade-in duration-300">
            {/* Header & Back Button */}
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold pb-2">
                <button 
                    onClick={onBack}
                    className="flex items-center space-x-1 hover:text-red-650 transition cursor-pointer text-slate-800 font-bold"
                >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Keranjang</span>
                </button>
                <span>/</span>
                <span className="text-slate-400">Checkout</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details (Address, Products, Shipping) */}
                <div className="lg:col-span-2 space-y-4">
                    
                    {/* 1. Shipping Address Section */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-500 via-blue-500 to-red-500" />
                        <div className="flex items-start space-x-3 mt-1.5">
                            <MapPin className="text-red-600 shrink-0 mt-0.5" size={18} />
                            <div className="grow space-y-1">
                                <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">Alamat Pengiriman</h4>
                                {isEditingAddress ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="Nama Penerima"
                                                value={tempAddress.name}
                                                onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                            />
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="Nomor Telepon"
                                                value={tempAddress.phone}
                                                onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                            />
                                        </div>
                                        <textarea 
                                            required
                                            rows="2"
                                            placeholder="Detail Alamat Lengkap"
                                            value={tempAddress.detail}
                                            onChange={(e) => setTempAddress({ ...tempAddress, detail: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                type="submit" 
                                                className="px-4 py-1.5 bg-red-600 text-white rounded-md text-xs font-bold shadow-xs hover:bg-red-700 cursor-pointer"
                                            >
                                                Simpan Alamat
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setTempAddress({ ...address });
                                                    setIsEditingAddress(false);
                                                }}
                                                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-200 cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-xs md:text-sm text-slate-700 font-semibold">
                                        <div className="font-extrabold text-slate-800">{address.name} ({address.phone})</div>
                                        <div className="text-slate-500 font-medium mt-1 leading-relaxed">{address.detail}</div>
                                        <button 
                                            onClick={() => setIsEditingAddress(true)}
                                            className="text-red-650 hover:text-red-700 text-xs font-bold mt-2 hover:underline cursor-pointer block"
                                        >
                                            Ubah Alamat Penerima
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Order Review Items */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5">
                        <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase mb-4 pb-2 border-b border-slate-100">Rincian Pesanan</h4>
                        <div className="divide-y divide-slate-100">
                            {cart.map((item, index) => (
                                <div key={index} className="py-3.5 flex items-center space-x-3.5 first:pt-0 last:pb-0">
                                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="grow min-w-0">
                                        <h5 className="text-xs md:text-sm font-bold text-slate-800 truncate">{item.product.name}</h5>
                                        <div className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5">Varian: {item.variant}</div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-slate-500 font-medium">{item.quantity} barang x Rp {item.product.price.toLocaleString('id-ID')}</span>
                                            <span className="text-xs md:text-sm font-extrabold text-slate-800">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Courier Selection */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
                            <Truck className="text-red-600" size={18} />
                            <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">Pilih Jasa Pengiriman</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {COURIERS.map((cour) => (
                                <button
                                    key={cour.id}
                                    onClick={() => setSelectedCourier(cour)}
                                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition duration-200 cursor-pointer ${
                                        selectedCourier.id === cour.id
                                            ? 'bg-red-50/40 border-red-500 shadow-xs ring-1 ring-red-500/20'
                                            : 'bg-white border-slate-200 hover:border-slate-350'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <span className="text-xl">{cour.logo}</span>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800">{cour.name}</div>
                                            <div className="text-[10px] text-slate-400 font-semibold">{cour.service}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-extrabold text-red-600">Rp {cour.price.toLocaleString('id-ID')}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Checkout Summary & Payment Methods */}
                <div className="space-y-4">
                    
                    {/* Payment Method Details */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5">
                        <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase mb-4 pb-2 border-b border-slate-100">Metode Pembayaran</h4>
                        <div className="p-3.5 rounded-xl border border-red-500 bg-red-50/40 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="bg-red-600 text-white p-1.5 rounded-lg">
                                    <Wallet size={16} />
                                </div>
                                <div>
                                    <div className="text-xs font-extrabold text-slate-800">Midtrans Payment</div>
                                    <div className="text-[10px] text-slate-400 font-semibold">Bayar Instan & Aman (VA/QRIS)</div>
                                </div>
                            </div>
                            <Check className="text-red-600" size={16} />
                        </div>
                    </div>

                    {/* Cost Summary & Pay Button */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 md:p-5 space-y-4">
                        <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase pb-2 border-b border-slate-100">Ringkasan Pembayaran</h4>
                        
                        <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between">
                                <span>Subtotal Produk</span>
                                <span className="text-slate-800">Rp {subtotalProducts.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subtotal Pengiriman</span>
                                <span className="text-slate-800">Rp {shippingFee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-extrabold text-slate-800">
                                <span>Total Pembayaran</span>
                                <span className="text-red-600 text-base">Rp {totalPayment.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className="w-full bg-linear-to-r from-red-650 via-red-600 to-red-950 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-red-600/20 transition duration-300 flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider text-xs"
                        >
                            <span>Buat Pesanan</span>
                        </button>

                        <div className="flex items-center justify-center space-x-1.5 text-[9px] text-slate-400 leading-normal pt-2">
                            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                            <span>Pembayaran diproses dengan enkripsi Midtrans Secure</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Midtrans Snap Popup Simulator Modal */}
            {showMidtrans && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col font-sans text-slate-700">
                        
                        {/* Midtrans Header */}
                        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                            <div className="flex items-center space-x-2">
                                <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">M</div>
                                <div>
                                    <h3 className="text-xs font-black tracking-wider uppercase">Midtrans Snap</h3>
                                    <p className="text-[9px] text-slate-400 font-bold -mt-0.5">PUTRI JAYA MOBIL</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowMidtrans(false)}
                                className="text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Midtrans Order Sum Info */}
                        <div className="bg-slate-50 px-5 py-3.5 flex justify-between items-center border-b border-slate-100 text-xs font-semibold shrink-0">
                            <div>
                                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">TOTAL TAGIHAN</div>
                                <div className="text-slate-800 font-black text-base mt-0.5">Rp {totalPayment.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">ORDER ID</div>
                                <div className="text-slate-800 font-bold mt-0.5">PJM-{Math.floor(100000 + Math.random() * 900000)}</div>
                            </div>
                        </div>

                        {/* Midtrans Dynamic Body */}
                        <div className="p-5 overflow-y-auto max-h-[350px] min-h-[250px] flex flex-col justify-between shrink-0">
                            {midtransStep === 'select_method' && (
                                <div className="space-y-2.5 grow">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">PILIH METODE PEMBAYARAN</div>
                                    
                                    {/* GoPay / QRIS */}
                                    <button 
                                        onClick={() => setMidtransStep('gopay')}
                                        className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer transition text-xs font-bold"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <span className="text-base"><QrCode size={16} className="text-indigo-600" /></span>
                                            <span>GoPay / QRIS (Instant)</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400" />
                                    </button>

                                    {/* Bank Transfer (Virtual Account) */}
                                    <button 
                                        onClick={() => setMidtransStep('va')}
                                        className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer transition text-xs font-bold"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <span className="text-base">🏦</span>
                                            <span>Transfer Bank (Virtual Account)</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400" />
                                    </button>

                                    {/* Credit Card */}
                                    <button 
                                        onClick={() => setMidtransStep('cc')}
                                        className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer transition text-xs font-bold"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <CreditCard size={16} className="text-blue-600" />
                                            <span>Kartu Kredit / Debit</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400" />
                                    </button>
                                </div>
                            )}

                            {midtransStep === 'gopay' && (
                                <div className="text-center space-y-4 grow flex flex-col items-center justify-center">
                                    <div className="text-[10px] font-bold text-indigo-600 tracking-wider">GOPAY / QRIS SCANNER</div>
                                    <div className="h-36 w-36 border border-slate-200 rounded-lg p-2 bg-white shadow-xs flex items-center justify-center relative group">
                                        <div className="absolute inset-x-2 top-2 h-0.5 bg-red-500 animate-pulse" />
                                        {/* Mock QR code drawing */}
                                        <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-70">
                                            {[...Array(25)].map((_, idx) => (
                                                <div key={idx} className={`rounded-sm ${(idx * 7 + 3) % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold">Pindai kode QR di atas menggunakan aplikasi pembayaran Anda</p>
                                    <button 
                                        onClick={handleSimulatePayment}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs cursor-pointer shadow-xs transition"
                                    >
                                        Simulasikan Sukses Scan & Bayar
                                    </button>
                                    <button onClick={() => setMidtransStep('select_method')} className="text-xs text-slate-400 font-bold hover:underline cursor-pointer">Kembali ke Pilihan</button>
                                </div>
                            )}

                            {midtransStep === 'va' && (
                                <div className="space-y-4 grow">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PILIH REKENING BANK</div>
                                    {!selectedBank ? (
                                        <div className="space-y-2">
                                            {['BCA', 'Mandiri', 'BNI', 'BRI'].map((bank) => (
                                                <button 
                                                    key={bank}
                                                    onClick={() => setSelectedBank(bank)}
                                                    className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer transition text-xs font-bold"
                                                >
                                                    <span>{bank} Virtual Account</span>
                                                    <ChevronRight size={14} className="text-slate-400" />
                                                </button>
                                            ))}
                                            <button onClick={() => setMidtransStep('select_method')} className="w-full text-center text-xs text-slate-400 font-bold hover:underline mt-2 cursor-pointer">Kembali</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 text-center">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{selectedBank} NOMOR VA</div>
                                                <div className="flex items-center justify-center space-x-2 mt-1">
                                                    <span className="text-base font-black text-slate-800 tracking-wider">88012081234567890</span>
                                                    <button onClick={handleCopyVA} className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer">
                                                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                {copied && <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded shadow">Salin Berhasil</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Gunakan Mobile Banking atau ATM terdekat untuk melakukan pembayaran instan</p>
                                            <button 
                                                onClick={handleSimulatePayment}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs cursor-pointer shadow-xs transition"
                                            >
                                                Simulasikan Transfer Sukses
                                            </button>
                                            <button onClick={() => setSelectedBank('')} className="text-xs text-slate-400 font-bold hover:underline cursor-pointer">Kembali ke Bank</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {midtransStep === 'cc' && (
                                <div className="space-y-4 grow flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KARTU KREDIT / DEBIT MOCK</div>
                                        <div className="space-y-2 text-left">
                                            <div>
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Nomor Kartu</label>
                                                <input type="text" disabled placeholder="4111 2222 3333 4444" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Masa Berlaku</label>
                                                    <input type="text" disabled placeholder="12/29" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase block">CVV</label>
                                                    <input type="password" disabled placeholder="•••" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        <button 
                                            onClick={handleSimulatePayment}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs cursor-pointer shadow-xs transition"
                                        >
                                            Simulasikan CC Bayar Sukses
                                        </button>
                                        <button onClick={() => setMidtransStep('select_method')} className="w-full text-center text-xs text-slate-400 font-bold hover:underline cursor-pointer">Kembali</button>
                                    </div>
                                </div>
                            )}

                            {midtransStep === 'success' && (
                                <div className="text-center space-y-4 py-8 grow flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                                    <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                                        <Check size={36} className="stroke-3" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm tracking-wide uppercase">Pembayaran Berhasil</h4>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-1">Midtrans memverifikasi transaksi Anda secara otomatis</p>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full">
                                        Dialihkan kembali ke halaman toko...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Midtrans Footer */}
                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-center items-center text-[9px] text-slate-400 font-bold shrink-0">
                            <span className="mr-1">🛡️</span> SECURE PAYMENT BY MIDTRANS
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
