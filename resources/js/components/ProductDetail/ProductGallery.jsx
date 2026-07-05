import React from 'react';
import { Heart } from 'lucide-react';

export default function ProductGallery({
    galleryImages,
    activeImage,
    setActiveImage,
    displayDiscount,
    onImageClick,
    product,
    isWishlist,
    onToggleWishlist,
}) {
    return (
        <div className="w-full md:w-[42%] shrink-0">
            {/* Big Showcase Image */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-inner flex items-center justify-center">
                <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
                    onClick={onImageClick}
                />
                {displayDiscount > 0 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow">
                        DISKON {displayDiscount}%
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                {galleryImages.map((imgUrl, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`h-16 w-16 md:h-18 md:w-18 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            activeImage === imgUrl ? 'border-red-600 shadow-sm' : 'border-slate-100 hover:border-slate-300'
                        }`}
                    >
                        <img src={imgUrl} alt="gallery" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>

            {/* Share & Wishlist Row */}
            <div className="flex items-center justify-between border-t border-slate-100 mt-6 pt-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center space-x-3">
                    <span>Bagikan:</span>
                    <button className="text-blue-600 hover:scale-110 transition cursor-pointer font-bold">Facebook</button>
                    <button className="text-sky-500 hover:scale-110 transition cursor-pointer font-bold">Twitter</button>
                    <button className="text-emerald-500 hover:scale-110 transition cursor-pointer font-bold">WhatsApp</button>
                </div>
                <span className="text-slate-200">|</span>
                <button
                    onClick={() => onToggleWishlist(product)}
                    className="flex items-center space-x-1.5 text-slate-650 hover:text-rose-500 transition cursor-pointer"
                >
                    <Heart size={16} className={isWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>Favorit ({isWishlist ? product.sold + 1 : product.sold})</span>
                </button>
            </div>
        </div>
    );
}
