import React from 'react';
import { Tag } from 'lucide-react';
import { formatRupiah } from '../../utils/helpers';
import useOrderSummary from '../../hooks/useOrderSummary';

export default function OrderSummary({
    subtotal,
    shippingFee,
    voucherDiscount,
    shippingDiscount,
    total,
    selectedVoucher,
    selectedShippingVoucher,
    setSelectedVoucher,
    setSelectedShippingVoucher,
    setVoucherDiscount,
    setShippingDiscount,
    onVoucherChange,
    onShippingVoucherChange
}) {
    const {
        vouchers,
        showVoucherDrawer,
        setShowVoucherDrawer,
        voucherInputCode,
        setVoucherInputCode,
        voucherError,
        handleApplyVoucher,
        handleRemoveVoucher
    } = useOrderSummary({
        subtotal,
        shippingFee,
        selectedVoucher,
        selectedShippingVoucher,
        setSelectedVoucher,
        setSelectedShippingVoucher,
        setVoucherDiscount,
        setShippingDiscount,
        onVoucherChange,
        onShippingVoucherChange
    });

    return (
        <>
            <div className="scp-summary-card" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 12 }}>Ringkasan Belanja</div>
                <div className="scp-sum-row">
                    <span>Subtotal Produk</span>
                    <span style={{ color: '#222', fontWeight: 600 }}>{formatRupiah(subtotal)}</span>
                </div>
                <div className="scp-sum-row">
                    <span>Biaya Pengiriman</span>
                    <span style={{ color: '#222', fontWeight: 600 }}>{formatRupiah(shippingFee)}</span>
                </div>
                <div className="scp-sum-row" style={{ marginBottom: 0 }}>
                    <span>Diskon Voucher</span>
                    <span style={{ color: '#c0001a', fontWeight: 600 }}>- {formatRupiah(voucherDiscount)}</span>
                </div>
                {selectedShippingVoucher ? (
                    <div className="scp-sum-row" style={{ marginBottom: 0, marginTop: 6 }}>
                        <span>Diskon Ongkir ({selectedShippingVoucher.code})</span>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>- {formatRupiah(shippingDiscount)}</span>
                    </div>
                ) : null}
                <div className="scp-sum-total">
                    <span className="scp-sum-total-label">Total Pembayaran</span>
                    <span className="scp-sum-total-val">{formatRupiah(total)}</span>
                </div>
            </div>

            {/* Voucher trigger card */}
            <div 
                className="scp-card" 
                style={{ 
                    padding: '12px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    cursor: 'pointer', 
                    marginBottom: 8,
                    borderLeft: (selectedVoucher || selectedShippingVoucher) ? '3px solid #c0001a' : ''
                }}
                onClick={() => setShowVoucherDrawer(true)}
            >
                <Tag size={15} color="#c0001a" />
                <div style={{ flex: 1 }}>
                    {(selectedVoucher || selectedShippingVoucher) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {selectedVoucher && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#c0001a' }}>
                                            Voucher Belanja: {selectedVoucher.code}
                                        </span>
                                        <div style={{ fontSize: 11, color: '#2e7d4a', fontWeight: 600 }}>
                                            Hemat {formatRupiah(voucherDiscount)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveVoucher('discount'); }}
                                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '2px 6px' }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}
                            {selectedShippingVoucher && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: selectedVoucher ? '1px dashed #eee' : 'none', paddingTop: selectedVoucher ? '4px' : '0' }}>
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
                                            Gratis Ongkir: {selectedShippingVoucher.code}
                                        </span>
                                        <div style={{ fontSize: 11, color: '#2e7d4a', fontWeight: 600 }}>
                                            Potongan {formatRupiah(shippingDiscount)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveVoucher('free_shipping'); }}
                                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '2px 6px' }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>Gunakan Voucher / Promo</span>
                    )}
                </div>
            </div>

            {/* Voucher Drawer */}
            {showVoucherDrawer && (
                <div className="vch-drawer-backdrop" onClick={() => setShowVoucherDrawer(false)}>
                    <div className="vch-drawer" onClick={e => e.stopPropagation()}>
                        <div className="vch-drawer-header">
                            <span className="vch-drawer-title">Pilih atau Masukkan Voucher</span>
                            <button onClick={() => setShowVoucherDrawer(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="vch-drawer-body">
                            <div className="vch-promo-input-box">
                                <input 
                                    type="text" 
                                    className="scp-input" 
                                    placeholder="Masukkan kode promo..." 
                                    value={voucherInputCode}
                                    onChange={(e) => setVoucherInputCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, textTransform: 'uppercase' }}
                                />
                                <button className="vch-btn-apply" onClick={() => handleApplyVoucher(voucherInputCode)} disabled={!voucherInputCode}>Terapkan</button>
                            </div>
                            
                            {voucherError && <div style={{ padding: 10, background: '#fff0f0', color: '#c0001a', borderRadius: 4, marginBottom: 16, fontSize: 12, fontWeight: 600 }}>{voucherError}</div>}
                            
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#222' }}>Voucher Tersedia</div>
                            {vouchers.length === 0 ? (
                                <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 32 }}>Tidak ada voucher tersedia saat ini.</p>
                            ) : (
                                vouchers.map(vch => {
                                    const isSelected = (selectedVoucher?.id === vch.id) || (selectedShippingVoucher?.id === vch.id);
                                    const isUsable = subtotal >= vch.min_purchase;
                                    return (
                                        <div key={vch.id} className={`vch-card ${isSelected ? 'selected' : ''}`}>
                                            <div className="vch-info">
                                                <span className="vch-code-badge">{vch.code}</span>
                                                <div className="vch-name">{vch.name}</div>
                                                <div className="vch-desc">
                                                    {vch.type === 'percentage' && `Diskon ${vch.value}% (Maks ${formatRupiah(vch.max_discount)})`}
                                                    {vch.type === 'fixed' && `Diskon ${formatRupiah(vch.value)}`}
                                                    {vch.type === 'free_shipping' && `Gratis Ongkir s/d ${formatRupiah(vch.value)}`}
                                                </div>
                                                <div className="vch-min">Min. Belanja: {formatRupiah(vch.min_purchase)}</div>
                                            </div>
                                            <button 
                                                className={`vch-select-btn ${isSelected ? 'active' : ''}`}
                                                disabled={!isUsable}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        handleRemoveVoucher(vch.type);
                                                    } else {
                                                        handleApplyVoucher(vch.code);
                                                    }
                                                }}
                                            >
                                                {!isUsable ? 'Syarat Tidak Terpenuhi' : isSelected ? 'Dipakai' : 'Pakai'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
