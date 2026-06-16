/**
 * Utility helper functions for the Putri Jaya Mobil frontend.
 */

/**
 * Format a numeric amount into Indonesian Rupiah format.
 * @param {number|string} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
    const value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return 'Rp ' + value.toLocaleString('id-ID');
}

/**
 * Get the CSRF token from the meta tag in the DOM.
 * @returns {string}
 */
export function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

/**
 * Get the store's WhatsApp phone number with fallback.
 * @param {object} settings
 * @returns {string}
 */
export function getWhatsAppNumber(settings) {
    return settings?.store_whatsapp || '6281234567890';
}

/**
 * Generate a WhatsApp link with an optional prefilled message text.
 * @param {object} settings
 * @param {string} [text=""]
 * @returns {string}
 */
export function getWhatsAppLink(settings, text = '') {
    const number = getWhatsAppNumber(settings);
    if (!text) {
        return `https://wa.me/${number}`;
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Get the store's name with fallback.
 * @param {object} settings
 * @returns {string}
 */
export function getStoreName(settings) {
    return settings?.store_name || 'Putri Jaya Mobil';
}

/**
 * Resolve the image URL for a product or order item's variant.
 * Handles absolute URLs, relative storage paths, and fallbacks.
 * @param {object} item
 * @returns {string}
 */
export function getProductImageUrl(item) {
    if (!item) return '/images/default-product.png';
    const img = item.product_variant?.product?.main_image || 
                item.productVariant?.product?.main_image || 
                item.product?.main_image || 
                item.main_image || 
                item.image;
    
    if (!img) return '/images/default-product.png';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/')) return img;
    return `/storage/${img}`;
}

/**
 * Inject Midtrans Snap script dynamically.
 * @param {object} settings
 */
export function loadMidtransSnap(settings) {
    if (!settings) return;
    
    const isProduction = settings.midtrans_is_production === '1' || 
                         settings.midtrans_is_production === true || 
                         settings.midtrans_is_production === 'true';
    
    const clientKey = settings.midtrans_client_key || 'SB-Mid-client-SQ4TW_FBC4Xy618R';
    const snapSrcUrl = isProduction 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

    // Check if script is already added
    let script = document.querySelector(`script[src="${snapSrcUrl}"]`);
    if (!script) {
        script = document.createElement('script');
        script.src = snapSrcUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);
    }
}
