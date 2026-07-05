import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Import sub-components
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductSpecs from './ProductSpecs';
import ProductReviews from './ProductReviews';
import ProductRecommendations from './ProductRecommendations';
import ImageGalleryModal from './ImageGalleryModal';
import VideoModal from './VideoModal';

export default function ProductDetailPage({
    product,
    products = [],
    onBack,
    onProductClick,
    onAddToCart,
    onBuyNow,
    wishlist = [],
    onToggleWishlist,
    settings = {}
}) {
    const { t } = useLanguage();

    // Varian & quantity
    const [selectedVariant, setSelectedVariant] = useState(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );
    const [quantity, setQuantity] = useState(1);

    // Wishlist check
    const isWishlist = wishlist.some((item) => parseInt(item.id) === parseInt(product.id));

    // Active image
    const [activeImage, setActiveImage] = useState(
        product.image || (product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.png')
    );

    // Image Zoom Modal state
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);
    const [modalImages, setModalImages] = useState(null);

    // Review system state
    const [reviewFilter, setReviewFilter] = useState('all');
    const [reviewPage, setReviewPage] = useState(1);
    const REVIEWS_PER_PAGE = 7;
    const [reviewLikes, setReviewLikes] = useState(() => {
        const init = {};
        (product.reviews || []).forEach(r => { init[r.id] = { count: r.likes_count, liked: r.user_liked }; });
        return init;
    });
    const [videoModal, setVideoModal] = useState(null); // URL string or null

    // Prices and discount computations
    const displayPrice = selectedVariant ? selectedVariant.price : product.price;
    const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
    const displayDiscount = selectedVariant && selectedVariant.discount !== undefined ? selectedVariant.discount : product.discount;
    const displayOriginalPrice = selectedVariant && selectedVariant.originalPrice !== undefined ? selectedVariant.originalPrice : product.originalPrice;

    // Sync selected variant image to active image
    useEffect(() => {
        if (selectedVariant && selectedVariant.image) {
            setActiveImage(selectedVariant.image);
        }
    }, [selectedVariant]);

    // Quantity selectors
    const incrementQty = () => setQuantity((prev) => {
        if (displayStock !== undefined && displayStock !== null) {
            return prev < displayStock ? prev + 1 : prev;
        }
        return prev + 1;
    });
    const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    // Like ulasan handler
    const handleReviewLike = async (reviewId) => {
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(`/api/reviews/${reviewId}/like`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
            });
            if (res.status === 401) { alert('Login terlebih dahulu untuk memberi like.'); return; }
            if (!res.ok) return;
            const data = await res.json();
            setReviewLikes(prev => ({
                ...prev,
                [reviewId]: { count: data.likes_count, liked: data.liked }
            }));
        } catch (e) { /* silent */ }
    };

    // Images gallery arrays
    const activeGallery = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
        ? selectedVariant.images
        : (product.images && product.images.length > 0 ? product.images : [product.image || '/images/default-product.png']);

    const rawGallery = [
        ...(selectedVariant && selectedVariant.image ? [selectedVariant.image] : []),
        ...activeGallery
    ];
    const galleryImages = Array.from(new Set(rawGallery));

    // Review filters & counts
    const allReviews = product.reviews || [];
    const totalReviewCount = allReviews.length;
    const avgRating = totalReviewCount > 0
        ? (allReviews.reduce((s, r) => s + r.rating, 0) / totalReviewCount).toFixed(1)
        : 0;
    const starCounts = [5, 4, 3, 2, 1].map(s => ({
        star: s,
        count: allReviews.filter(r => r.rating === s).length,
    }));
    const withCommentCount = allReviews.filter(r => r.comment && r.comment.trim() !== '').length;
    const withMediaCount = allReviews.filter(r => (r.photo_urls && r.photo_urls.length > 0) || r.video_url).length;
    const filteredReviews = allReviews.filter(r => {
        if (reviewFilter === 'all') return true;
        if (reviewFilter === 'comment') return r.comment && r.comment.trim() !== '';
        if (reviewFilter === 'media') return (r.photo_urls && r.photo_urls.length > 0) || r.video_url;
        return r.rating === parseInt(reviewFilter);
    });
    const reviewFilterTabs = [
        { key: 'all', label: `Semua (${totalReviewCount})` },
        ...starCounts.map(({ star, count }) => ({ key: String(star), label: `${star} Bintang (${count})` })),
        { key: 'comment', label: `Dengan Komentar (${withCommentCount})` },
        { key: 'media', label: `Dengan Media (${withMediaCount})` },
    ];
    const totalReviewPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
    const safeReviewPage = Math.min(reviewPage, totalReviewPages);
    const pagedReviews = filteredReviews.slice((safeReviewPage - 1) * REVIEWS_PER_PAGE, safeReviewPage * REVIEWS_PER_PAGE);

    return (
        <div className="space-y-4 py-4 animate-in fade-in duration-300">
            {/* Breadcrumb & Back Button */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-1 hover:text-red-650 transition cursor-pointer text-slate-800 font-bold"
                    >
                        <ArrowLeft size={16} />
                        <span>Kembali ke Toko</span>
                    </button>
                    <span>/</span>
                    <span>{product.category}</span>
                    <span>/</span>
                    <span className="text-slate-400 truncate max-w-[200px] md:max-w-none">{product.name}</span>
                </div>
            </div>

            {/* Main Product Showcase Card */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Left Column: Image Gallery & Sharing */}
                <ProductGallery
                    galleryImages={galleryImages}
                    activeImage={activeImage}
                    setActiveImage={setActiveImage}
                    displayDiscount={displayDiscount}
                    onImageClick={() => {
                        const idx = galleryImages.indexOf(activeImage);
                        setModalImageIndex(idx >= 0 ? idx : 0);
                        setIsImageModalOpen(true);
                    }}
                    product={product}
                    isWishlist={isWishlist}
                    onToggleWishlist={onToggleWishlist}
                />

                {/* Right Column: Detailed Product Configurator */}
                <ProductInfo
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                    displayPrice={displayPrice}
                    displayOriginalPrice={displayOriginalPrice}
                    displayDiscount={displayDiscount}
                    displayStock={displayStock}
                    quantity={quantity}
                    incrementQty={incrementQty}
                    decrementQty={decrementQty}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    settings={settings}
                />
            </div>

            {/* Bottom Specifications & Description Grid */}
            <ProductSpecs
                product={product}
                selectedVariant={selectedVariant}
            />

            {/* Penilaian Produk */}
            <ProductReviews
                reviews={product.reviews}
                reviewFilter={reviewFilter}
                setReviewFilter={setReviewFilter}
                reviewPage={reviewPage}
                setReviewPage={setReviewPage}
                pagedReviews={pagedReviews}
                safeReviewPage={safeReviewPage}
                totalReviewPages={totalReviewPages}
                avgRating={avgRating}
                totalReviewCount={totalReviewCount}
                reviewFilterTabs={reviewFilterTabs}
                reviewLikes={reviewLikes}
                onLike={handleReviewLike}
                onOpenReviewImage={(images, index) => {
                    setModalImages(images);
                    setModalImageIndex(index);
                    setIsImageModalOpen(true);
                }}
                setVideoModal={setVideoModal}
            />

            {/* Produk Rekomendasi */}
            <ProductRecommendations
                currentProduct={product}
                products={products}
                onProductClick={onProductClick}
                onAddToCart={onAddToCart}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
                settings={settings}
            />

            {/* Image Gallery Zoom Modal */}
            <ImageGalleryModal
                isOpen={isImageModalOpen}
                onClose={() => {
                    setIsImageModalOpen(false);
                    setTimeout(() => setModalImages(null), 300); // reset after animation
                }}
                galleryImages={modalImages || galleryImages}
                modalImageIndex={modalImageIndex}
                setModalImageIndex={setModalImageIndex}
                productName={product.name}
            />

            {/* Video Player Modal */}
            <VideoModal
                videoUrl={videoModal}
                onClose={() => setVideoModal(null)}
            />
        </div>
    );
}
