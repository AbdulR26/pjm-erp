import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGalleryModal({
    isOpen,
    onClose,
    galleryImages,
    modalImageIndex,
    setModalImageIndex,
    productName,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 md:p-8"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 transition cursor-pointer bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
                >
                    <X size={20} />
                </button>

                {/* Left: Large image preview */}
                <div className="w-full md:w-[65%] bg-slate-900 flex items-center justify-center relative aspect-square md:aspect-auto md:h-[70vh] select-none">
                    <img
                        src={galleryImages[modalImageIndex] || '/images/default-product.png'}
                        alt={productName}
                        className="max-w-full max-h-full object-contain"
                    />
                    {galleryImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setModalImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
                            }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-800/60 hover:bg-slate-800 text-white py-6 px-3 transition cursor-pointer flex items-center justify-center"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    {galleryImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setModalImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-800/60 hover:bg-slate-800 text-white py-6 px-3 transition cursor-pointer flex items-center justify-center"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>

                {/* Right: Thumbnails & title */}
                <div className="w-full md:w-[35%] p-6 flex flex-col justify-start border-l border-slate-100 overflow-y-auto max-h-[40vh] md:max-h-[70vh]">
                    <h2 className="text-xs md:text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-5 pr-8">
                        {productName}
                    </h2>
                    <div className="grid grid-cols-3 gap-2.5">
                        {galleryImages.map((imgUrl, i) => (
                            <button
                                key={i}
                                onClick={() => setModalImageIndex(i)}
                                className={`aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                                    modalImageIndex === i ? 'border-red-600 shadow-md' : 'border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
