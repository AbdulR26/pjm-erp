import React from 'react';
import { Truck } from 'lucide-react';
import { formatRupiah } from '../../utils/helpers';
import useShippingSelector from '../../hooks/useShippingSelector';

export default function ShippingSelector({ 
    address, 
    cart, 
    selectedCourier, 
    setSelectedCourier 
}) {
    const {
        couriers,
        loadingRates,
        ratesError
    } = useShippingSelector({ address, cart, selectedCourier, setSelectedCourier });

    return (
        <div className="scp-card">
            <div className="scp-card-header">
                <Truck size={16} color="#c0001a" />
                <span className="scp-card-title">Pilih Pengiriman</span>
            </div>
            <div className="scp-card-body">
                {loadingRates ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="scp-spin" style={{ width: 24, height: 24, border: '3px solid #f3f3f3', borderTop: '3px solid #c0001a', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Memeriksa ongkos kirim...</span>
                    </div>
                ) : ratesError ? (
                    <div style={{ padding: '12px', border: '1px solid #ffcccc', background: '#fff0f0', color: '#c0001a', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        ⚠️ {ratesError}
                    </div>
                ) : !address?.postal_code ? (
                    <div style={{ padding: '16px', border: '1px dashed #ddd', color: '#666', borderRadius: 4, fontSize: 12, textAlign: 'center' }}>
                        Silakan lengkapi alamat dan <strong>Kode Pos</strong> pengiriman terlebih dahulu untuk menghitung ongkos kirim.
                    </div>
                ) : couriers.length === 0 ? (
                    <div style={{ padding: '16px', border: '1px dashed #ddd', color: '#666', borderRadius: 4, fontSize: 12, textAlign: 'center' }}>
                        Tidak ada layanan pengiriman yang tersedia untuk alamat ini.
                    </div>
                ) : (
                    couriers.map(cour => (
                        <button
                            key={`${cour.id}-${cour.service}`}
                            className={`scp-courier-option ${selectedCourier && selectedCourier.id === cour.id && selectedCourier.service === cour.service ? 'active' : ''}`}
                            onClick={() => setSelectedCourier(cour)}
                            style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        >
                            <div className="scp-courier-radio">
                                {selectedCourier && selectedCourier.id === cour.id && selectedCourier.service === cour.service && <div className="scp-courier-dot" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="scp-courier-name">{cour.name}</div>
                                <div className="scp-courier-service">{cour.service}</div>
                                <span className="scp-courier-eta">Estimasi {cour.eta}</span>
                            </div>
                            <div className="scp-courier-price">{formatRupiah(cour.price)}</div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
