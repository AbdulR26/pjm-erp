import React from 'react';

export default function ProductSpecs({ product, selectedVariant }) {
    const hasSpecs = product.specs && Object.keys(product.specs).length > 0;
    const hasWeight = selectedVariant?.weight || product.weight;

    return (
        <div className="grid grid-cols-1 gap-4 mt-6">
            {/* Specifications Card */}
            {(hasSpecs || hasWeight) && (
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-slate-100">
                    <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-3">
                        Spesifikasi Produk
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs md:text-sm">
                        {product.specs && Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="flex border-b border-slate-100/50 pb-2">
                                <span className="w-32 md:w-40 shrink-0 font-bold text-slate-400">{key}</span>
                                <span className="text-slate-800 font-medium">{value}</span>
                            </div>
                        ))}
                        {hasWeight && (
                            <div className="flex border-b border-slate-100/50 pb-2 last:border-0 last:pb-0">
                                <span className="w-32 md:w-40 shrink-0 font-bold text-slate-400">Berat</span>
                                <span className="text-slate-800 font-medium">
                                    {selectedVariant?.weight || product.weight} gram
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Description Card */}
            <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-slate-100">
                <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-3">
                    Deskripsi Produk
                </h3>
                <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-medium whitespace-pre-line">
                    {product.description}
                </p>
            </div>
        </div>
    );
}
