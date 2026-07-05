import React from 'react';
import { Star, Play, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductReviews({
    reviews,
    reviewFilter,
    setReviewFilter,
    reviewPage,
    setReviewPage,
    pagedReviews,
    safeReviewPage,
    totalReviewPages,
    avgRating,
    totalReviewCount,
    reviewFilterTabs,
    reviewLikes,
    onLike,
    onOpenReviewImage,
    setVideoModal
}) {
    const [activeReviewPhoto, setActiveReviewPhoto] = React.useState(null);

    return (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 md:px-6 pt-5 pb-0">
                <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-800 tracking-wider mb-5">
                    Penilaian Produk
                </h3>

                {/* Summary row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                    <div className="flex items-end gap-2 shrink-0">
                        <span className="text-5xl font-extrabold text-orange-500 leading-none">{avgRating}</span>
                        <span className="text-sm text-slate-500 font-semibold mb-1">dari 5</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex text-orange-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={22} className={i < Math.round(avgRating) ? 'fill-current' : 'text-slate-200 fill-slate-100'} />
                            ))}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{totalReviewCount} ulasan</span>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
                    {reviewFilterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setReviewFilter(tab.key); setReviewPage(1); }}
                            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded border transition-all whitespace-nowrap cursor-pointer ${
                                reviewFilter === tab.key
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                                    : 'border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 bg-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Review list */}
            <div className="divide-y divide-slate-100">
                {pagedReviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                        {totalReviewCount === 0 ? 'Belum ada penilaian untuk produk ini.' : 'Tidak ada ulasan dengan filter ini.'}
                    </div>
                ) : (
                    pagedReviews.map((rev) => {
                        const likeState = reviewLikes[rev.id] ?? { count: rev.likes_count, liked: rev.user_liked };
                        const initials = (rev.customer_name || 'P').charAt(0).toUpperCase();
                        return (
                            <div key={rev.id} className="px-5 md:px-6 py-5">
                                {/* Avatar + Name + Stars + Date */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold text-sm select-none">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{rev.customer_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="flex text-orange-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < rev.rating ? 'fill-current' : 'text-slate-200 fill-slate-100'} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {rev.created_at}
                                                {rev.variant_name && <> | Variasi: {rev.variant_name}</>}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comment */}
                                {rev.comment && (
                                    <p className="text-xs text-slate-700 leading-relaxed mb-3 ml-12">{rev.comment}</p>
                                )}

                                {/* Media Grid */}
                                {((rev.photo_urls && rev.photo_urls.length > 0) || rev.video_url) && (
                                    <div className="flex flex-wrap gap-2 mb-3 ml-12">
                                        {(rev.photo_urls || []).map((url, pi) => (
                                            <button
                                                key={pi}
                                                onClick={() => onOpenReviewImage(rev.photo_urls, pi)}
                                                className="w-20 h-20 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shrink-0 cursor-zoom-in hover:opacity-90 transition"
                                            >
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                        {rev.video_url && (
                                            <button
                                                onClick={() => setVideoModal(rev.video_url)}
                                                className="w-20 h-20 rounded-md overflow-hidden border border-slate-200 bg-slate-900 shrink-0 cursor-pointer hover:opacity-90 transition relative flex items-center justify-center"
                                            >
                                                <video src={rev.video_url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted preload="metadata" />
                                                <div className="relative z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">
                                                    <Play size={14} className="text-slate-800 fill-slate-800 ml-0.5" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Seller Reply */}
                                {rev.seller_reply && (
                                    <div className="ml-12 bg-slate-50 rounded-lg px-4 py-3 mb-3 border border-slate-100">
                                        <p className="text-[11px] font-extrabold text-slate-700 mb-1">Respon Penjual:</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{rev.seller_reply}</p>
                                        {rev.seller_reply_at && (
                                            <span className="text-[10px] text-slate-400 block mt-1.5">{rev.seller_reply_at}</span>
                                        )}
                                    </div>
                                )}

                                {/* Like Button */}
                                <div className="flex items-center gap-2 ml-12 mt-1">
                                    <button
                                        onClick={() => onLike(rev.id)}
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                            likeState.liked
                                                ? 'bg-orange-50 border-orange-300 text-orange-600'
                                                : 'border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-500 bg-white'
                                        }`}
                                    >
                                        <ThumbsUp size={12} className={likeState.liked ? 'fill-orange-500 text-orange-500' : ''} />
                                        {likeState.count > 0 && <span>{likeState.count}</span>}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Nav */}
            {totalReviewPages > 1 && (
                <div className="flex items-center justify-between px-5 md:px-6 py-4 border-t border-slate-100">
                    <button
                        onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                        disabled={safeReviewPage === 1}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                            safeReviewPage === 1
                                ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                                : 'border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 bg-white cursor-pointer'
                        }`}
                    >
                        <ChevronLeft size={14} /> Sebelumnya
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setReviewPage(p)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                    safeReviewPage === p
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                                        : 'border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 bg-white'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setReviewPage(p => Math.min(totalReviewPages, p + 1))}
                        disabled={safeReviewPage === totalReviewPages}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                            safeReviewPage === totalReviewPages
                                ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                                : 'border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 bg-white cursor-pointer'
                        }`}
                    >
                        Selanjutnya <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
