import React from 'react';
import { Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatRupiah } from '../../utils/helpers';
import useShippingChecker from '../../hooks/useShippingChecker';

const POPULAR_CITIES = [
    { name: 'Jakarta Pusat', postal: '10110' },
    { name: 'Jakarta Selatan', postal: '12110' },
    { name: 'Surabaya', postal: '60111' },
    { name: 'Bandung', postal: '40111' },
    { name: 'Bekasi', postal: '17110' },
    { name: 'Tangerang', postal: '15110' },
    { name: 'Sidoarjo', postal: '61211' },
    { name: 'Medan', postal: '20111' },
    { name: 'Makassar', postal: '90111' },
];

export default function ShippingChecker({ product, selectedVariant, quantity, settings }) {
    const { t } = useLanguage();
    const {
        postalCodeInput,
        setPostalCodeInput,
        shippingRates,
        loadingRates,
        ratesError,
        showPopularCities,
        setShowPopularCities,
        handleCheckShipping
    } = useShippingChecker({ product, selectedVariant, quantity });

    return (
        <div className="space-y-3.5 text-xs md:text-sm text-slate-500 pb-5 border-b border-slate-100">
            <div className="flex">
                <span className="w-24 md:w-32 shrink-0 font-bold text-slate-400">Pengiriman</span>
                <div className="space-y-1.5 font-medium text-slate-700 grow">
                    <div className="flex items-center space-x-2">
                        <Truck size={16} className="text-slate-500" />
                        <span>Pengiriman dari: <strong>{settings.store_city || 'Kota Bekasi'}</strong></span>
                    </div>
                    <div className="text-slate-500 text-xs">Ongkos kirim mulai dari Rp 10.000 (Melalui ekspedisi partner/kurir toko)</div>

                    {/* Rate Checker Widget */}
                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2.5 max-w-md">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            {t('products.check_shipping')}
                        </div>
                        <div className="flex gap-2 relative">
                            <div className="relative grow">
                                <input
                                    type="text"
                                    placeholder={t('products.shipping_dest')}
                                    value={postalCodeInput}
                                    onChange={(e) => { setPostalCodeInput(e.target.value); setShowPopularCities(true); }}
                                    onFocus={() => setShowPopularCities(true)}
                                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-red-500 placeholder-slate-400"
                                />
                                {showPopularCities && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-40 text-xs font-semibold py-1">
                                        <div className="px-2.5 py-1 text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">Kota Populer</div>
                                        {POPULAR_CITIES.filter(c =>
                                            c.name.toLowerCase().includes(postalCodeInput.toLowerCase()) ||
                                            c.postal.includes(postalCodeInput)
                                        ).map(city => (
                                            <button
                                                key={city.postal}
                                                type="button"
                                                onClick={() => {
                                                    setPostalCodeInput(`${city.name} (${city.postal})`);
                                                    setShowPopularCities(false);
                                                    handleCheckShipping(city.postal);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition"
                                            >
                                                {city.name} - {city.postal}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPopularCities(false);
                                    const match = postalCodeInput.match(/\((\d{5})\)/);
                                    const code = match ? match[1] : postalCodeInput;
                                    handleCheckShipping(code);
                                }}
                                disabled={loadingRates}
                                className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs px-4 py-1.5 rounded-md transition duration-200 cursor-pointer shadow-xs disabled:opacity-60"
                            >
                                {t('products.check_rates_btn')}
                            </button>
                        </div>

                        {/* Close dropdown backdrop */}
                        {showPopularCities && (
                            <div className="fixed inset-0 z-30" onClick={() => setShowPopularCities(false)} />
                        )}

                        {loadingRates && (
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce"></span>
                                <span>{t('products.shipping_loading')}</span>
                            </div>
                        )}

                        {ratesError && (
                            <div className="text-[11px] text-red-600 font-semibold">⚠️ {ratesError}</div>
                        )}

                        {shippingRates.length > 0 && (
                            <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                                {shippingRates.map((rate, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-2 rounded-md hover:border-red-200 transition duration-200">
                                        <div className="space-y-0.5">
                                            <div className="text-xs font-bold text-slate-800">
                                                {rate.courier_name} <span className="text-[9px] text-red-650 font-bold uppercase">{rate.courier_service_name}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium">
                                                Estimasi: {rate.duration} {rate.duration.toLowerCase().includes('hari') ? '' : 'hari'}
                                            </div>
                                        </div>
                                        <div className="text-xs font-extrabold text-red-600">{formatRupiah(rate.price)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
