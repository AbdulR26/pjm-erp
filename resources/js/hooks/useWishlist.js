import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export function useWishlist(currentUser, products) {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('pjm_wishlist');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // Sync wishlist from database when currentUser logs in
    useEffect(() => {
        if (currentUser) {
            fetch('/api/wishlist')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setWishlist(data);
                        localStorage.setItem('pjm_wishlist', JSON.stringify(data));
                    }
                })
                .catch(err => console.error("Gagal memuat wishlist dari database:", err));
        } else {
            // Load local storage fallback for guest
            const saved = localStorage.getItem('pjm_wishlist');
            if (saved) {
                try {
                    setWishlist(JSON.parse(saved));
                } catch (e) {
                    setWishlist([]);
                }
            } else {
                setWishlist([]);
            }
        }
    }, [currentUser]);

    const handleToggleWishlist = (product) => {
        let fullProduct = product;
        if (product && !product.name && product.id) {
            const found = products.find(p => parseInt(p.id) === parseInt(product.id));
            if (found) {
                fullProduct = found;
            }
        }

        const isExist = wishlist.some((item) => parseInt(item.id) === parseInt(fullProduct.id));
        let newWishlist;
        if (isExist) {
            newWishlist = wishlist.filter((item) => parseInt(item.id) !== parseInt(fullProduct.id));
        } else {
            newWishlist = [...wishlist, fullProduct];
        }
        
        // Optimistic UI updates
        setWishlist(newWishlist);
        localStorage.setItem('pjm_wishlist', JSON.stringify(newWishlist));

        // Sync with database if logged in
        if (currentUser) {
            fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ product_id: fullProduct.id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status !== 'success') {
                    console.error("Gagal menyinkronkan wishlist:", data.message);
                }
            })
            .catch(err => {
                console.error("Gagal menyinkronkan wishlist:", err);
            });
        }
    };

    return {
        wishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        handleToggleWishlist
    };
}
