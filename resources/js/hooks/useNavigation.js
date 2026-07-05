import { useState, useEffect } from 'react';

export function useNavigation(initialPage, products, currentUser, handleGoToLoginPage) {
    const [isCartPageActive, setIsCartPageActive] = useState(initialPage === 'cart');
    const [isCheckoutActive, setIsCheckoutActive] = useState(initialPage === 'checkout');
    const [isFlashSalePageActive, setIsFlashSalePageActive] = useState(initialPage === 'flash-sale');
    const [isLoginPageActive, setIsLoginPageActive] = useState(initialPage === 'login');
    const [isUserProfileActive, setIsUserProfileActive] = useState(initialPage === 'profile');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const navigateTo = (pageName, extraParams = {}) => {
        if ((pageName === 'profile' || pageName === 'checkout') && !currentUser) {
            handleGoToLoginPage(pageName);
            return;
        }

        const queryParams = new URLSearchParams();
        if (pageName && pageName !== 'home') {
            queryParams.set('page', pageName);
        }
        Object.keys(extraParams).forEach(key => {
            if (key !== 'product') {
                queryParams.set(key, extraParams[key]);
            }
        });
        
        const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : '/';
        window.history.pushState({}, '', newUrl);

        setIsUserProfileActive(pageName === 'profile');
        setIsLoginPageActive(pageName === 'login');
        setIsCheckoutActive(pageName === 'checkout');
        setIsFlashSalePageActive(pageName === 'flash-sale');
        setIsCartPageActive(pageName === 'cart');
        
        if (pageName === 'product') {
            const productObj = extraParams.product || products.find(p => p.id === parseInt(extraParams.product_id));
            if (productObj) {
                setSelectedProduct(productObj);
            }
        } else {
            setSelectedProduct(null);
        }
    };

    // Listen to popstate event (browser Back/Forward buttons)
    useEffect(() => {
        const handlePopState = () => {
            const p = new URLSearchParams(window.location.search);
            const page = p.get('page') || 'home';
            const prodId = p.get('product_id');

            setIsUserProfileActive(page === 'profile');
            setIsLoginPageActive(page === 'login');
            setIsCheckoutActive(page === 'checkout');
            setIsFlashSalePageActive(page === 'flash-sale');
            setIsCartPageActive(page === 'cart');

            if (page === 'product' && prodId && products.length > 0) {
                const found = products.find(prod => prod.id === parseInt(prodId));
                if (found) setSelectedProduct(found);
            } else {
                setSelectedProduct(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [products]);

    return {
        isCartPageActive,
        isCheckoutActive,
        isFlashSalePageActive,
        isLoginPageActive,
        isUserProfileActive,
        selectedProduct,
        setSelectedProduct,
        setIsLoginPageActive,
        setIsUserProfileActive,
        setIsCheckoutActive,
        navigateTo
    };
}
