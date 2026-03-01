"use client";

import { Announcement } from "@/app/actions/announcements";
import { useState } from "react";
import ClickableContent from "./ClickableContent";

export default function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (announcements.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {announcements.map((item) => (
                <div
                    key={item.id}
                    className={`p-4 rounded-xl border-l-4 shadow-sm animate-in slide-in-from-top-2 ${item.type === 'IMPORTANT' ? 'bg-red-50 border-red-500 text-red-900' :
                        item.type === 'WARNING' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                            'bg-blue-50 border-blue-500 text-blue-900'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${item.type === 'IMPORTANT' ? 'bg-red-100 text-red-600' :
                            item.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                            <span className="material-symbols-outlined">
                                {item.type === 'IMPORTANT' ? 'campaign' : item.type === 'WARNING' ? 'warning' : 'info'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                <span className="text-xs opacity-70">
                                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <ClickableContent content={item.content} className="text-sm opacity-90 whitespace-pre-wrap" />
                            {item.image && (
                                <div className="mt-3 rounded-lg overflow-hidden border border-black/10 max-w-sm cursor-pointer" onClick={() => setSelectedImage(item.image)}>
                                    <img src={item.image} alt={item.title} className="w-full h-auto object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoom"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95"
                    />
                </div>
            )}
        </div>
    );
}
