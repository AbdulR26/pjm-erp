import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, Tag, ArrowLeft } from 'lucide-react';
import { formatRupiah, getStoreName } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import useCartPage from '../hooks/useCartPage';

export default function CartPage({
    cartItems = [],
    onUpdateQty,
    onRemoveItem,
    onCheckout,
    onBack,
    settings = {}
}) {
    const { t } = useLanguage();
    const storeName = getStoreName(settings);

    // Use custom hook for all business logic
    const {
        checkedItems,
        isAllChecked,
        checkedCartItems,
        totalItemsCount,
        checkedSubtotal,
        vouchers,
        showVoucherModal,
        setShowVoucherModal,
        selectedVoucher,
        voucherDiscount,
        voucherInputCode,
        setVoucherInputCode,
        voucherError,
        getItemKey,
        handleToggleCheck,
        handleToggleAll,
        handleApplyVoucher,
        handleRemoveVoucher,
        handleCheckoutClick,
        handleBulkDelete
    } = useCartPage(cartItems, onCheckout, onRemoveItem);

    return (
        <div className="space-y-4 py-4 animate-in fade-in duration-300 max-w-[1200px] mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-1 hover:text-red-650 transition cursor-pointer text-slate-800 font-bold"
                >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Toko</span>
                </button>
                <div className="text-slate-400">Keranjang Belanja</div>
            </div>

            {cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-xs">
                    <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
                        <ShoppingCart size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Keranjang Belanja Kosong</h3>
                    <p className="text-xs text-slate-500 max-w-sm mb-6">
                        Belum ada barang di keranjang belanja Anda. Ayo jelajahi produk terbaik kami!
                    </p>
                    <button
                        onClick={onBack}
                        className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs px-8 py-3 rounded-lg shadow-sm transition cursor-pointer uppercase tracking-wider"
                    >
                        Mulai Belanja
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Main Cart Table (Desktop/Table Layout) */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
                            <div className="col-span-6 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isAllChecked}
                                    onChange={handleToggleAll}
                                    className="w-4.5 h-4.5 accent-red-650 rounded border-slate-300 cursor-pointer"
                                />
                                <span>Produk</span>
                            </div>
                            <div className="col-span-2 text-center">Harga Satuan</div>
                            <div className="col-span-2 text-center">Kuantitas</div>
                            <div className="col-span-1 text-center">Total Harga</div>
                            <div className="col-span-1 text-right">Aksi</div>
                        </div>

                        {/* Store Header */}
                        <div className="px-6 py-3 border-b border-slate-50 flex items-center gap-3 bg-white">
                            <input
                                type="checkbox"
                                checked={isAllChecked}
                                onChange={handleToggleAll}
                                className="w-4.5 h-4.5 accent-red-650 rounded border-slate-300 cursor-pointer"
                            />
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Toko</span>
                                <span>{storeName}</span>
                            </div>
                        </div>

                        {/* Cart Items List */}
                        <div className="divide-y divide-slate-100 bg-white">
                            {cartItems.map((item, idx) => {
                                const key = getItemKey(item);
                                const isChecked = !!checkedItems[key];
                                return (
                                    <div key={idx} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        {/* Product Column */}
                                        <div className="col-span-1 md:col-span-6 flex items-start gap-3">
                                            <div className="pt-5 md:pt-0 self-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleCheck(item)}
                                                    className="w-4.5 h-4.5 accent-red-650 rounded border-slate-300 cursor-pointer shrink-0"
                                                />
                                            </div>
                                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                                                    {item.product.name}
                                                </h4>
                                                {item.variant && (
                                                    <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 mt-1.5">
                                                        Variasi: {item.variant}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unit Price */}
                                        <div className="col-span-2 text-left md:text-center flex md:block justify-between text-xs md:text-sm">
                                            <span className="md:hidden text-slate-400 font-semibold">Harga Satuan:</span>
                                            <span className="font-bold text-slate-800">{formatRupiah(item.product.price)}</span>
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="col-span-2 flex md:justify-center items-center justify-between text-xs md:text-sm">
                                            <span className="md:hidden text-slate-400 font-semibold">Kuantitas:</span>
                                            <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                                                <button
                                                    onClick={() => onUpdateQty(item.product.id, item.variant, item.quantity - 1)}
                                                    className="p-1 md:p-1.5 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                                >
                                                    <Minus size={13} />
                                                </button>
                                                <span className="px-2 py-0.5 md:px-3 text-xs md:text-sm font-extrabold text-slate-800 min-w-8 text-center select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => onUpdateQty(item.product.id, item.variant, item.quantity + 1)}
                                                    className="p-1 md:p-1.5 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                                >
                                                    <Plus size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="col-span-1 text-left md:text-center flex md:block justify-between text-xs md:text-sm">
                                            <span className="md:hidden text-slate-400 font-semibold">Subtotal:</span>
                                            <span className="font-extrabold text-red-600">{formatRupiah(item.product.price * item.quantity)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 text-right">
                                            <button
                                                onClick={() => onRemoveItem(item.product, item.variant)}
                                                className="text-slate-400 hover:text-red-650 transition cursor-pointer p-1.5"
                                                title="Hapus produk"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Voucher Store Section */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                            <Tag size={16} className="text-red-600" />
                            <span className="font-semibold text-slate-700">Voucher Belanja</span>
                            {selectedVoucher && (
                                <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 ml-2">
                                    {selectedVoucher.code} (-{formatRupiah(voucherDiscount)})
                                    <button onClick={handleRemoveVoucher} className="hover:text-red-800 font-bold ml-1 cursor-pointer">×</button>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowVoucherModal(true)}
                            className="text-xs font-bold text-red-600 hover:text-red-750 transition cursor-pointer"
                        >
                            {selectedVoucher ? 'Ganti Voucher' : 'Gunakan / Masukkan Kode'}
                        </button>
                    </div>

                    {/* Bottom Action Footer Panel (Sticky Style) */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky bottom-4 z-30">
                        <div className="flex items-center gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isAllChecked}
                                    onChange={handleToggleAll}
                                    className="w-4.5 h-4.5 accent-red-650 rounded border-slate-300 cursor-pointer"
                                />
                                <span className="font-semibold text-slate-600">Pilih Semua ({cartItems.length})</span>
                            </div>
                            <button
                                onClick={handleBulkDelete}
                                disabled={checkedCartItems.length === 0}
                                className={`font-semibold cursor-pointer transition ${
                                    checkedCartItems.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-red-650 hover:text-red-800'
                                }`}
                            >
                                Hapus Terpilih ({checkedCartItems.length})
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-end md:items-center gap-4 text-right md:text-left">
                            <div className="text-xs md:text-sm font-semibold text-slate-650">
                                <span>Total ({totalItemsCount} Produk): </span>
                                <span className="text-base md:text-xl font-black text-red-600">
                                    {formatRupiah(Math.max(0, checkedSubtotal - voucherDiscount))}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckoutClick}
                                disabled={checkedCartItems.length === 0}
                                className={`w-full md:w-auto px-10 py-3 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition duration-250 ${
                                    checkedCartItems.length === 0
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-linear-to-r from-red-650 to-red-800 hover:from-red-700 hover:to-red-950 cursor-pointer hover:shadow-red-500/25'
                                }`}
                            >
                                Checkout ({checkedCartItems.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Voucher Modal Drawer */}
            {showVoucherModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => setShowVoucherModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Voucher Belanja</h3>
                            <button
                                onClick={() => setShowVoucherModal(false)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 flex-1 overflow-y-auto space-y-4">
                            {/* Input Code */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Masukkan kode voucher"
                                    value={voucherInputCode}
                                    onChange={(e) => setVoucherInputCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-red-500"
                                />
                                <button
                                    onClick={() => handleApplyVoucher(voucherInputCode)}
                                    disabled={!voucherInputCode}
                                    className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs px-5 py-2 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50"
                                >
                                    Gunakan
                                </button>
                            </div>

                            {voucherError && (
                                <div className="text-xs text-red-600 font-bold">⚠️ {voucherError}</div>
                            )}

                            {/* List vouchers */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-1">Voucher Tersedia</h4>
                                {vouchers.filter(vch => vch.type !== 'free_shipping').length === 0 ? (
                                    <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                                        Tidak ada voucher belanja yang tersedia saat ini.
                                    </div>
                                ) : (
                                    vouchers
                                        .filter(vch => vch.type !== 'free_shipping')
                                        .map((vch) => {
                                            const isDisabled = checkedSubtotal < vch.min_spend;
                                            const isSelected = selectedVoucher?.id === vch.id;
                                            return (
                                                <button
                                                    key={vch.id}
                                                    disabled={isDisabled}
                                                    onClick={() => handleApplyVoucher(vch.code)}
                                                    className={`w-full text-left p-3.5 rounded-lg border-2 transition duration-200 flex flex-col gap-1 ${
                                                        isSelected
                                                            ? 'border-red-600 bg-red-50/10'
                                                            : isDisabled
                                                                ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60'
                                                                : 'border-slate-150 hover:border-red-400 bg-white cursor-pointer'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                                            {vch.code}
                                                        </span>
                                                        {isSelected && <span className="text-[10px] font-bold text-red-600 uppercase">Dipasang</span>}
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-800 mt-1.5">
                                                        {vch.type === 'percent' ? `Diskon ${vch.value}%` : `Potongan ${formatRupiah(vch.value)}`}
                                                    </div>
                                                    {vch.type === 'percent' && vch.max_discount && (
                                                        <div className="text-[10px] text-slate-400 font-semibold">Maks. Potongan: {formatRupiah(vch.max_discount)}</div>
                                                    )}
                                                    <div className="text-[10px] text-slate-500 font-medium mt-1">Min. Belanja: {formatRupiah(vch.min_spend)}</div>
                                                </button>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
