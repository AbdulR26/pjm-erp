import React from 'react';

export default function SkeletonLoader() {
    return (
        <div className="space-y-8 py-6 animate-pulse">
            {/* Banner Carousel Skeleton */}
            <div className="w-full h-[180px] md:h-[380px] bg-slate-200 rounded-2xl"></div>

            {/* Categories Skeleton */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
                {/* Title */}
                <div className="h-4 w-32 bg-slate-200 rounded-md mb-6"></div>
                {/* Circles */}
                <div className="flex md:grid md:grid-cols-8 gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex-none w-[78px] md:w-auto flex flex-col items-center justify-center">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-slate-200"></div>
                            <div className="h-3 w-12 bg-slate-200 rounded-md mt-2.5"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flash Sale Skeleton */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
                {/* Title and Countdown */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
                        <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                    </div>
                    <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                </div>
                {/* Flash Sale Items */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-3">
                            <div className="aspect-square w-full bg-slate-200 rounded-lg"></div>
                            <div className="h-4 w-3/4 bg-slate-200 rounded-md"></div>
                            <div className="h-4 w-1/2 bg-slate-200 rounded-md"></div>
                            <div className="h-2 w-full bg-slate-200 rounded-md"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Section Filter Bar Skeleton */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="h-4 w-12 bg-slate-200 rounded-md"></div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-20 bg-slate-200 rounded-md"></div>
                        <div className="h-8 w-20 bg-slate-200 rounded-md"></div>
                        <div className="h-8 w-20 bg-slate-200 rounded-md"></div>
                    </div>
                </div>
                <div className="h-4 w-36 bg-slate-200 rounded-md"></div>
            </div>

            {/* Product Section Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 p-3.5 space-y-4 shadow-sm">
                        {/* Image */}
                        <div className="aspect-square w-full bg-slate-200 rounded-lg"></div>
                        
                        {/* Details */}
                        <div className="space-y-2.5">
                            {/* Category */}
                            <div className="h-2.5 w-1/3 bg-slate-200 rounded-md"></div>
                            {/* Title */}
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-full bg-slate-200 rounded-md"></div>
                                <div className="h-3.5 w-5/6 bg-slate-200 rounded-md"></div>
                            </div>
                            {/* Price */}
                            <div className="h-4.5 w-1/2 bg-slate-200 rounded-md"></div>
                            
                            <hr className="border-slate-50 mt-4" />
                            
                            {/* Rating / Location info */}
                            <div className="flex justify-between items-center pt-1">
                                <div className="h-3 w-8 bg-slate-200 rounded-md"></div>
                                <div className="h-3 w-12 bg-slate-200 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
