import { useState, useEffect } from 'react';

export function useCart(currentUser, handleGoToLoginPage, navigateTo, setSelectedCartItems) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart dari localStorage jika ada
    useEffect(() => {
        const savedCart = localStorage.getItem('pjm_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    let needsSave = false;
                    const sanitized = parsed.map(item => {
                        if (typeof item.variant === 'object' && item.variant !== null) {
                            needsSave = true;
                            return {
                                ...item,
                                variant: item.variant.name || ''
                            };
                        }
                        return item;
                    });
                    setCart(sanitized);
                    if (needsSave) {
                        localStorage.setItem('pjm_cart', JSON.stringify(sanitized));
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Simpan cart ke localStorage
    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('pjm_cart', JSON.stringify(newCart));
    };

    const handleAddToCart = (product, quantity = 1, variant = '') => {
        if (!currentUser) {
            handleGoToLoginPage('cart');
            return;
        }

        const selectedVariantObj = variant || (product.variants && product.variants[0]) || '';
        const selectedVariant = typeof selectedVariantObj === 'object' && selectedVariantObj !== null
            ? selectedVariantObj.name
            : selectedVariantObj;
            
        const existingItemIndex = cart.findIndex(
            (item) => item.product.id === product.id && item.variant === selectedVariant
        );

        let newCart = [...cart];
        if (existingItemIndex > -1) {
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart.push({
                product,
                quantity,
                variant: selectedVariant
            });
        }
        saveCart(newCart);
    };

    const handleRemoveFromCart = (productId, variant) => {
        const newCart = cart.filter(
            (item) => !(item.product.id === productId && item.variant === variant)
        );
        saveCart(newCart);
    };

    const handleUpdateCartQty = (productId, variant, newQty) => {
        if (newQty < 1) {
            handleRemoveFromCart(productId, variant);
            return;
        }
        const newCart = cart.map((item) => {
            if (item.product.id === productId && item.variant === variant) {
                return { ...item, quantity: newQty };
            }
            return item;
        });
        saveCart(newCart);
    };

    const handleCheckout = () => {
        if (!currentUser) {
            handleGoToLoginPage('checkout');
            return;
        }
        // Default to all cart items if checking out from drawer
        setSelectedCartItems(cart);
        navigateTo('checkout');
        setIsCartOpen(false);
    };

    return {
        cart,
        setCart,
        saveCart,
        isCartOpen,
        setIsCartOpen,
        handleAddToCart,
        handleRemoveFromCart,
        handleUpdateCartQty,
        handleCheckout
    };
}
