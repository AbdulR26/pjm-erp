import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export default function useShippingSelector({ address, cart, selectedCourier, setSelectedCourier }) {
    const [couriers, setCouriers] = useState([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState('');

    const fetchRates = async (addr) => {
        if (!addr.postal_code) return;
        setLoadingRates(true);
        setRatesError('');
        try {
            const csrfToken = getCsrfToken();
            const items = cart.map(item => ({
                product_id: item.product.id,
                variant_name: item.variant,
                quantity: item.quantity
            }));
            const response = await fetch('/api/shipment/rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    postal_code: addr.postal_code,
                    latitude: addr.latitude || null,
                    longitude: addr.longitude || null,
                    items
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengambil ongkir');
            }

            const rawRates = data.rates || [];
            const formattedCouriers = rawRates.map(rate => ({
                id: rate.courier_code,
                name: rate.courier_name,
                service: rate.courier_service_name,
                price: rate.price,
                eta: `${rate.duration} ${rate.duration.toLowerCase().includes('hari') ? '' : 'hari'}`,
                courier_service_code: rate.courier_service_code
            }));

            setCouriers(formattedCouriers);
            if (formattedCouriers.length > 0) {
                // Pre-select if not already selected
                if (!selectedCourier || !formattedCouriers.some(c => c.id === selectedCourier.id && c.service === selectedCourier.service)) {
                    setSelectedCourier(formattedCouriers[0]);
                }
            } else {
                setSelectedCourier(null);
                setRatesError('Tidak ada layanan pengiriman yang tersedia untuk area ini.');
            }
        } catch (err) {
            console.error(err);
            setRatesError(err.message || 'Gagal menghitung ongkos kirim. Silakan periksa kembali kode pos Anda.');
            setCouriers([]);
            setSelectedCourier(null);
        } finally {
            setLoadingRates(false);
        }
    };

    // Prevent infinite loop by stringifying cart reference and watching primitive address properties
    const cartDependency = JSON.stringify((cart || []).map(i => ({ id: i.product.id, qty: i.quantity, v: i.variant })));

    useEffect(() => {
        if (address && address.postal_code) {
            fetchRates(address);
        } else {
            setCouriers([]);
            setSelectedCourier(null);
        }
    }, [address?.postal_code, address?.latitude, address?.longitude, cartDependency]);

    return {
        couriers,
        loadingRates,
        ratesError
    };
}
