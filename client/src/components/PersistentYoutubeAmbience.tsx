'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store';

/**
 * YouTube Ambience Component
 * - Persists YouTube Video ID in localStorage
 * - Validates YouTube links and extracts ID
 * - Embeds video in a modal with autoplay and loop
 * - Includes volume and stop controls
 */
export const PersistentYoutubeAmbience: React.FC = () => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();
    const { isAuthenticated } = useAppStore();

    // Load from localStorage on mount
    useEffect(() => {
        const savedId = localStorage.getItem('ambience_yt_id');
        if (savedId) {
            setVideoId(savedId);
        }
    }, []);

    // Auto-hide controls logic
    useEffect(() => {
        if (!isModalOpen) return;

        const handleMouseMove = () => {
            setShowControls(true);
            if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
            mouseTimerRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000); // 3 seconds of inactivity
        };

        window.addEventListener('mousemove', handleMouseMove);
        handleMouseMove(); // Start timer

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
        };
    }, [isModalOpen]);

    const extractVideoId = (url: string) => {
        const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleSetAmbience = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        const id = extractVideoId(youtubeUrl);
        if (id) {
            setVideoId(id);
            localStorage.setItem('ambience_yt_id', id);
            setYoutubeUrl('');
            setError(null);
        } else {
            setError('Lütfen geçerli bir YouTube linki girin.');
        }
    };

    const handleRemoveAmbience = () => {
        setVideoId(null);
        localStorage.removeItem('ambience_yt_id');
        setIsModalOpen(false);
    };

    if (isModalOpen && videoId) {
        return (
            <div
                ref={containerRef}
                className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500"
            >
                {/* Modal Header - Sadece Kapat butonu */}
                <div className={`absolute top-0 left-0 right-0 p-6 flex justify-end items-center z-20 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all transform hover:rotate-90 border border-white/10 backdrop-blur-md"
                        title="Kapat"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Container - Yerel YouTube Kontrolleri Aktif */}
                <div className="relative w-full h-full md:w-[95%] md:h-[90%] md:rounded-3xl overflow-hidden shadow-2xl bg-black">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`}
                        title="YouTube Ambiyans"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
            <div className="bg-dark-bg-secondary/30 backdrop-blur-md border border-warm-beige/10 rounded-[2rem] p-6 shadow-soft-lg">
                <div className="flex items-center gap-4 mb-5">
                    <div className="p-2.5 rounded-xl bg-warm-beige/10 border border-warm-beige/20 text-warm-beige">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-semibold text-warm-beige leading-tight">Kendi YouTube Ambiyansını Ekle</h3>
                    </div>
                </div>

                {!videoId ? (
                    <div className="space-y-3">
                        <div className="relative group">
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="YouTube linkini yapıştırın..."
                                className="w-full bg-black/40 border border-white/5 group-hover:border-warm-beige/30 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-warm-beige/10 transition-all text-sm font-light caret-warm-beige"
                            />
                        </div>

                        {error && <p className="text-red-400 text-[10px] px-2 uppercase tracking-wider">{error}</p>}

                        <button
                            onClick={handleSetAmbience}
                            className="w-full bg-warm-dark hover:bg-warm-beige text-dark-bg-primary font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
                        >
                            Ambiyans Olarak Ayarla
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        router.push('/login');
                                        return;
                                    }
                                    setIsModalOpen(true);
                                }}
                                className="flex-1 bg-warm-beige/5 hover:bg-warm-beige/10 border border-warm-beige/20 text-warm-beige font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-warm-beige/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <span className="text-sm">Ambiyansı Başlat</span>
                            </button>

                            <button
                                onClick={handleRemoveAmbience}
                                className="aspect-square bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl transition-all flex items-center justify-center group"
                                title="Kaldır"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
