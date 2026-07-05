import { useState } from 'react';

export default function useProductSection(products, searchQuery, selectedCategory) {
    const [sortBy, setSortBy] = useState('rekomendasi');
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filter produk berdasarkan kategori, pencarian, harga, dan rating
    let filteredProducts = products.filter((prod) => {
        const matchesCategory = selectedCategory === 'Semua' || prod.category === selectedCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              prod.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const priceNum = Number(prod.price);
        const matchesMinPrice = appliedMinPrice === null || appliedMinPrice === '' || priceNum >= Number(appliedMinPrice);
        const matchesMaxPrice = appliedMaxPrice === null || appliedMaxPrice === '' || priceNum <= Number(appliedMaxPrice);
        
        const matchesRating = selectedRating === 0 || Number(prod.rating) >= selectedRating;

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRating;
    });

    // Urutkan produk
    if (sortBy === 'harga-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'harga-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'terlaris') {
        filteredProducts.sort((a, b) => b.sold - a.sold);
    } else if (sortBy === 'terbaru') {
        filteredProducts.sort((a, b) => b.id - a.id); // Simulasikan id lebih tinggi = terbaru
    }

    const handleApplyFilters = () => {
        setAppliedMinPrice(minPriceInput);
        setAppliedMaxPrice(maxPriceInput);
        setIsMobileFilterOpen(false);
    };

    const handleResetFilters = () => {
        setMinPriceInput('');
        setMaxPriceInput('');
        setAppliedMinPrice(null);
        setAppliedMaxPrice(null);
        setSelectedRating(0);
        setIsMobileFilterOpen(false);
    };

    const isFilterActive = appliedMinPrice !== null || appliedMaxPrice !== null || selectedRating !== 0 || minPriceInput || maxPriceInput;

    return {
        sortBy, setSortBy,
        minPriceInput, setMinPriceInput,
        maxPriceInput, setMaxPriceInput,
        appliedMinPrice, setAppliedMinPrice,
        appliedMaxPrice, setAppliedMaxPrice,
        selectedRating, setSelectedRating,
        isMobileFilterOpen, setIsMobileFilterOpen,
        filteredProducts,
        handleApplyFilters,
        handleResetFilters,
        isFilterActive
    };
}
