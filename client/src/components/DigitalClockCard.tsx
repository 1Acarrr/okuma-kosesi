'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFocusSession } from '../hooks/useFocusSession';

interface DigitalClockCardProps {
  onOpen?: () => void;
  className?: string;
}

export const DigitalClockCard: React.FC<DigitalClockCardProps> = ({
  onOpen,
  className = '',
}) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInfinite, setIsInfinite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClockFullscreen, setIsClockFullscreen] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalMinutesRef = useRef(0);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // İstatistik kaydetme hook'u
  useFocusSession(isRunning, isInfinite, totalMinutesRef.current);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsClockFullscreen(document.fullscreenElement === fullscreenRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (isInfinite) {
          // Sonsuz mod: ileriye doğru say
          setSeconds((prev) => {
            if (prev === 59) {
              setMinutes((m) => {
                const newMinutes = m + 1;
                totalMinutesRef.current = newMinutes;
                return newMinutes;
              });
              return 0;
            }
            return prev + 1;
          });
        } else {
          // Normal mod: geriye doğru say
          setSeconds((prev) => {
            if (prev === 0) {
              setMinutes((m) => {
                if (m === 0) {
                  setIsRunning(false);
                  return 0;
                }
                return m - 1;
              });
              return 59;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isInfinite]);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsRunning(false);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(targetMinutes);
    setSeconds(0);
    totalMinutesRef.current = 0;
  };

  const handleClockFullscreen = () => {
    const el = fullscreenRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const m1 = Math.floor(minutes / 10);
  const m2 = minutes % 10;
  const s1 = Math.floor(seconds / 10);
  const s2 = seconds % 10;

  const DigitPanel: React.FC<{ digit: number; large?: boolean }> = ({ digit, large }) => (
    <div
      className={`relative bg-[#2a2a2a] rounded-lg border border-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.2)] ${
        large
          ? 'px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12'
          : 'px-2 py-3 sm:px-3 sm:py-4'
      }`}
    >
      <div className={`absolute top-1 left-2 right-2 h-px bg-[#444] ${large ? 'left-4 right-4 top-2' : ''}`} />
      <span
        className={`font-mono font-bold text-[#e0e0e0] tracking-tight ${
          large ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl' : 'text-2xl sm:text-3xl md:text-4xl'
        }`}
      >
        {digit}
      </span>
    </div>
  );

  return (
    <>
      <div
        onClick={handleOpen}
        className={`relative aspect-video rounded-2xl overflow-hidden border-2 border-warm-beige/20 cursor-pointer transition-all hover:border-warm-beige/40 shadow-soft ${className}`}
      >
        <Image
          src="/saat.jpg"
          alt="Dijital Saat"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif font-semibold text-lg text-warm-beige drop-shadow-lg">
            Dijital Saat
          </h3>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-2xl border-2 border-warm-beige/20 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif font-semibold text-2xl text-warm-beige mb-6 text-center">
              Dijital Saat
            </h3>

            {/* Clock Display */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <DigitPanel digit={m1} />
              <DigitPanel digit={m2} />
              <div className="flex flex-col gap-1 px-1 self-center">
                <span className="w-2 h-2 rounded-full bg-[#888]" />
                <span className="w-2 h-2 rounded-full bg-[#888]" />
              </div>
              <DigitPanel digit={s1} />
              <DigitPanel digit={s2} />
            </div>

            {/* Settings */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-text-light text-sm">Süre (dakika):</label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={targetMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setTargetMinutes(val);
                    if (!isRunning) {
                      setMinutes(val);
                      setSeconds(0);
                    }
                  }}
                  disabled={isRunning}
                  className="px-3 py-2 bg-dark-bg-secondary border border-warm-beige/20 rounded-lg text-warm-beige w-24"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="infinite"
                  checked={isInfinite}
                  onChange={(e) => {
                    setIsInfinite(e.target.checked);
                    if (e.target.checked) {
                      setTargetMinutes(0);
                      setMinutes(0);
                      setSeconds(0);
                      totalMinutesRef.current = 0;
                    } else {
                      setMinutes(targetMinutes);
                      setSeconds(0);
                    }
                  }}
                  disabled={isRunning}
                  className="w-5 h-5 accent-warm-beige"
                />
                <label htmlFor="infinite" className="text-text-light text-sm cursor-pointer">
                  Sonsuz Mod
                </label>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-center">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="px-6 py-3 rounded-xl bg-warm-beige hover:bg-warm-light text-dark-bg-primary font-semibold transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Başlat
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-6 py-3 rounded-xl bg-warm-beige/20 hover:bg-warm-beige/30 text-warm-beige border border-warm-beige/30 font-semibold transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Duraklat
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-dark-bg-secondary hover:bg-dark-bg-darker text-text-light font-semibold transition"
              >
                Sıfırla
              </button>
              <button
                onClick={handleClockFullscreen}
                className="px-6 py-3 rounded-xl bg-dark-bg-secondary hover:bg-dark-bg-darker text-warm-beige border border-warm-beige/30 font-semibold transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Tam Ekran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tam ekran container: modal açıkken DOM'da, Tam Ekran tıklanınca fullscreen bu div üzerinde */}
      {isOpen && (
        <div
          ref={fullscreenRef}
          className={`fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center ${
            isClockFullscreen ? '' : 'opacity-0 pointer-events-none invisible'
          }`}
        >
          {/* Flip-clock defter görünümü - büyük paneller */}
          <div className="flex items-center gap-3 sm:gap-5">
            <DigitPanel digit={m1} large />
            <DigitPanel digit={m2} large />
            <div className="flex flex-col gap-2 sm:gap-3 px-1 self-center">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#888]" />
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#888]" />
            </div>
            <DigitPanel digit={s1} large />
            <DigitPanel digit={s2} large />
          </div>
          {/* Play butonu - görseldeki gibi mavi çerçeveli */}
          <button
            onClick={isRunning ? handlePause : handleStart}
            className="mt-10 w-16 h-14 sm:w-20 sm:h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center border-2 border-blue-500 hover:border-blue-400 transition"
          >
            {isRunning ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          {/* Tam ekrandan çık */}
          <button
            onClick={handleClockFullscreen}
            className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-medium transition"
          >
            Tam Ekrandan Çık
          </button>
        </div>
      )}
    </>
  );
};
