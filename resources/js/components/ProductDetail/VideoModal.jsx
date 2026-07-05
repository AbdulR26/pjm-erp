import React from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ videoUrl, onClose }) {
    if (!videoUrl) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 text-white bg-black/50 hover:bg-black/80 p-2 rounded-full cursor-pointer transition"
                >
                    <X size={20} />
                </button>
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[80vh] object-contain"
                />
            </div>
        </div>
    );
}
