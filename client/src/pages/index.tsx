import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const videos = [
  { id: 1, src: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_1.mp4', name: 'Kuş Cıvıltısı' },
  { id: 2, src: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_2.mp4', name: 'Akarsu' },
  { id: 3, src: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_3.mp4', name: 'Nehir' },
  { id: 4, src: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_4.mp4', name: 'Kamp' },
  { id: 5, src: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_5.mp4', name: 'Uzay' },
];

export default function Home() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Otomatik kaydırma
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 5000); // 5 saniyede bir değişir

    return () => clearInterval(interval);
  }, []);

  const goToVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const goToPrevious = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <main className="min-h-screen bg-dark-bg-primary">
      {/* Video Carousel Section */}
      <section className="relative py-12 md:py-16 flex items-center justify-center bg-dark-bg-primary">
        <div className="w-full max-w-7xl px-4">
          <div className="flex flex-col items-center justify-center mb-10">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-white mb-0 text-center leading-relaxed select-none opacity-90 px-2 sm:px-0">
              Okurken, çalışırken veya sadece durup nefes alırken…
            </p>
          </div>
          {/* Video Container - Büyütülmüş ve Mobile Uyumlu (Telefonda daha dik/karemsi) */}
          <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-video flex items-center justify-center mb-6 md:mb-8">
            {/* Video */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              {videos.map((video, index) => (
                <video
                  key={video.id}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              ))}

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35), rgba(0,0,0,0.55))'
                }}
              />

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-all backdrop-blur-sm"
                aria-label="Önceki video"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-all backdrop-blur-sm"
                aria-label="Sonraki video"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Video Indicators */}
          <div className="flex justify-center gap-3 mb-12">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => goToVideo(index)}
                className={`transition-all rounded-full ${index === currentVideoIndex
                  ? 'bg-warm-beige w-12 h-3'
                  : 'bg-warm-beige/30 w-3 h-3 hover:bg-warm-beige/50'
                  }`}
                aria-label={`${video.name} videosuna geç`}
              />
            ))}
          </div>

          {/* Content Below Video - Removed icons as requested */}
        </div>
      </section>



    </main>
  );
}
