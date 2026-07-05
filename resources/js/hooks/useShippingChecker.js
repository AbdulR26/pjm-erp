import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function useShippingChecker({ product, selectedVariant, quantity }) {
    const { t } = useLanguage();
    const [postalCodeInput, setPostalCodeInput] = useState('');
    const [shippingRates, setShippingRates] = useState([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState('');
    const [showPopularCities, setShowPopularCities] = useState(false);

    const handleCheckShipping = async (postalCode) => {
        const targetPostal = postalCode || postalCodeInput;
        if (!targetPostal || targetPostal.trim().length < 3) {
            setRatesError('Masukkan Kota / Kode Pos yang valid');
            return;
        }
        setLoadingRates(true);
        setRatesError('');
        setShippingRates([]);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/api/shipment/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    postal_code: targetPostal.trim(),
                    items: [{ product_id: product.id, variant_name: selectedVariant || '', quantity }],
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || t('products.shipping_empty_rates'));
            const rawRates = data.rates || [];
            setShippingRates(rawRates);
            if (rawRates.length === 0) setRatesError(t('products.shipping_empty_rates'));
        } catch (err) {
            setRatesError(err.message || 'Gagal memuat ongkir. Silakan periksa koneksi atau kode pos Anda.');
        } finally {
            setLoadingRates(false);
        }
    };

    return {
        postalCodeInput,
        setPostalCodeInput,
        shippingRates,
        loadingRates,
        ratesError,
        showPopularCities,
        setShowPopularCities,
        handleCheckShipping
    };
}
