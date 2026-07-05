import { useState, useEffect } from 'react';

export default function useFlashSalePage({ products, settings, onBack }) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false
    });

    // Countdown Timer logic based on settings end time
    useEffect(() => {
        const endTimeStr = settings.flash_sale_end_time;
        if (!endTimeStr) return;

        const updateTimer = () => {
            const normalizedStr = endTimeStr.replace(' ', 'T');
            const endTime = new Date(normalizedStr);
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setTimeLeft({ hours, minutes, seconds, isExpired: false });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [settings.flash_sale_end_time]);

    // Get all flash sale products dynamically from loaded products
    const flashProducts = (products || [])
        .filter(p => p.is_flash_sale)
        .map(p => {
            const remaining = p.flash_sale_stock ?? 0;
            const mockSold = (p.id % 4) + 4; 
            const totalStock = remaining + mockSold;
            const soldPercent = remaining === 0 ? 100 : (totalStock > 0 ? Math.round((mockSold / totalStock) * 100) : 0);
            return {
                ...p,
                soldPercent,
                remaining
            };
        });

    // Handle auto-return when expired or no products
    useEffect(() => {
        if (timeLeft.isExpired || flashProducts.length === 0) {
            const timer = setTimeout(() => {
                onBack();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft.isExpired, flashProducts.length, onBack]);

    return {
        timeLeft,
        flashProducts
    };
}
