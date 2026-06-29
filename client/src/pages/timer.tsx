import React, { useState, useEffect, useRef } from 'react';
import { useFocusSession } from '../hooks/useFocusSession';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import apiClient from '../lib/api';

import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store';

const playSound = (type: 'start' | 'pause' | 'finish') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + startTime);
      osc.stop(audioCtx.currentTime + startTime + duration);
    };

    if (type === 'start') {
      playTone(440, 'sine', 0.2, 0);
      playTone(554, 'sine', 0.4, 0.1);
    } else if (type === 'pause') {
      playTone(300, 'sine', 0.2, 0);
    } else if (type === 'finish') {
      playTone(523.25, 'sine', 0.2, 0); // C5
      playTone(659.25, 'sine', 0.2, 0.15); // E5
      playTone(783.99, 'sine', 0.4, 0.3); // G5
      playTone(1046.50, 'sine', 0.8, 0.45); // C6
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function TimerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const DEFAULT_WORK_MINUTES = 15;

  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInfinite, setIsInfinite] = useState(true);
  const [targetMinutes, setTargetMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [showDigital, setShowDigital] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [inputValue, setInputValue] = useState(String(DEFAULT_WORK_MINUTES));
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  const [currentSoundName, setCurrentSoundName] = useState('Kuş Cıvıltısı');
  const [currentSoundUrl, setCurrentSoundUrl] = useState('https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_1.mp4');

  // YouTube States
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load YouTube ID from local storage
  useEffect(() => {
    const savedId = localStorage.getItem('ambience_yt_id');
    if (savedId) setYoutubeId(savedId);
  }, []);

  const extractVideoId = (url: string) => {
    const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleYoutubeUpdate = () => {
    const id = extractVideoId(youtubeInput);
    if (id) {
      setYoutubeId(id);
      setIsYoutubePlaying(true);
      localStorage.setItem('ambience_yt_id', id);
      setYoutubeInput('');
    }
  };


  const minsStr = String(minutes).padStart(2, '0');
  const secsStr = String(seconds).padStart(2, '0');

  // Flip animation state
  const prevMinsStrRef = useRef(minsStr);
  const prevSecsStrRef = useRef(secsStr);
  const [flippingMins, setFlippingMins] = useState<Set<number>>(new Set());
  const [flippingSecs, setFlippingSecs] = useState<Set<number>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalMinutesRef = useRef(0);
  const soundMenuRef = useRef<HTMLDivElement>(null);
  const fsSoundMenuRef = useRef<HTMLDivElement>(null);

  // Load timer state on mount
  useEffect(() => {
    const saved = localStorage.getItem('okuma_timer_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        const now = Date.now();
        const lastUpdated = state.lastUpdated || now;
        const elapsedSecs = Math.floor((now - lastUpdated) / 1000);

        setTargetMinutes(state.targetMinutes || DEFAULT_WORK_MINUTES);
        setInputValue(String(state.targetMinutes || DEFAULT_WORK_MINUTES));
        setIsInfinite(state.isInfinite ?? true);
        
        let newMins = state.minutes || 0;
        let newSecs = state.seconds || 0;
        let running = state.isRunning || false;

        if (running && elapsedSecs > 0) {
          const missedMins = Math.floor(elapsedSecs / 60);
          if (missedMins > 0) {
             // Tab kapalıyken geçen süreyi istatistiklere ekle
             apiClient.post('/stats/focus-session', {
               durationMinutes: missedMins,
               isInfinite: state.isInfinite ?? true
             }).catch(() => console.error("Failed to sync offline minutes"));
          }

          if (state.isInfinite) {
            const totalS = newMins * 60 + newSecs + elapsedSecs;
            newMins = Math.floor(totalS / 60);
            newSecs = totalS % 60;
          } else {
            const totalS = newMins * 60 + newSecs - Math.min(elapsedSecs, newMins * 60 + newSecs); // Clamp to avoid negative
            if (totalS <= 0) {
              newMins = 0;
              newSecs = 0;
              running = false;
            } else {
              newMins = Math.floor(totalS / 60);
              newSecs = totalS % 60;
            }
          }
        }

        setMinutes(newMins);
        setSeconds(newSecs);
        setIsRunning(running);

        if (state.totalMinutesRef !== undefined) {
           totalMinutesRef.current = state.totalMinutesRef + (state.isInfinite && running ? Math.floor(elapsedSecs / 60) : 0);
        }
      } catch (e) {
        console.error("Failed to load timer state");
      }
    }
    setInitialLoadDone(true);
  }, []);

  // Save timer state on change
  useEffect(() => {
    if (!initialLoadDone) return;
    const state = {
      minutes,
      seconds,
      isRunning,
      isInfinite,
      targetMinutes,
      totalMinutesRef: totalMinutesRef.current,
      lastUpdated: Date.now()
    };
    localStorage.setItem('okuma_timer_state', JSON.stringify(state));
  }, [minutes, seconds, isRunning, isInfinite, targetMinutes, initialLoadDone]);

  useFocusSession(isRunning, isInfinite);
  const { isPlaying: isSoundPlaying, togglePlay: toggleSound, volume, setVolume } = useAudioPlayer(currentSoundUrl);

  // Sync YouTube Volume and Playback
  useEffect(() => {
    if (currentSoundName === 'YouTube' && iframeRef.current && iframeRef.current.contentWindow) {
      // Volume Control (0-100)
      const vol = Math.floor(volume * 100);
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [vol]
      }), '*');

      // Play/Pause Control
      const command = isYoutubePlaying ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: command,
        args: []
      }), '*');
    }
  }, [volume, isYoutubePlaying, currentSoundName, youtubeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*$/.test(val)) {
      if (val !== '' && parseInt(val) > 180) {
        setInputValue('180');
      } else {
        setInputValue(val);
      }
    }
  };

  const handlePresetClick = (mins: number) => {
    setInputValue(String(mins));
  };

  const handleSoundSelect = (name: string, url: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (currentSoundUrl !== url) {
      setCurrentSoundUrl(url);
      setCurrentSoundName(name);
      if (name === 'YouTube') {
        setIsYoutubePlaying(true);
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDigital) {
        setShowDigital(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showDigital]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideMain = soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node);
      const isOutsideFs = fsSoundMenuRef.current && !fsSoundMenuRef.current.contains(event.target as Node);
      
      if ((!soundMenuRef.current || isOutsideMain) && (!fsSoundMenuRef.current || isOutsideFs)) {
        setShowSoundMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (isInfinite) {
          if (seconds === 59) {
            setMinutes(m => m + 1);
            setSeconds(0);
            totalMinutesRef.current += 1;
          } else {
            setSeconds(s => s + 1);
          }
        } else {
          if (minutes === 0 && seconds === 0) {
            setIsRunning(false);
            playSound('finish');
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else if (seconds === 0) {
            setMinutes(m => m - 1);
            setSeconds(59);
          } else {
            setSeconds(s => s - 1);
          }
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isInfinite, minutes, seconds]);

  const handleStart = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    playSound('start');
    setIsRunning(true);
  };
  const handlePause = () => {
    playSound('pause');
    setIsRunning(false);
  };
  const handleFinish = () => {
    playSound('finish');
    setIsRunning(false);
    if (isInfinite) {
      setMinutes(0);
      setSeconds(0);
      totalMinutesRef.current = 0;
    } else {
      setMinutes(0);
      setSeconds(0);
    }
  };
  const handleReset = () => {
    playSound('pause');
    setIsRunning(false);
    if (isInfinite) {
      setMinutes(0);
      setSeconds(0);
      totalMinutesRef.current = 0;
    } else {
      setMinutes(targetMinutes);
      setSeconds(0);
    }
  };

  const handleApplySettings = () => {
    let num = parseInt(inputValue);
    
    if (isNaN(num) || num < 15) {
      num = 15;
      setInputValue('15');
    } else if (num > 180) {
      num = 180;
      setInputValue('180');
    }

    setTargetMinutes(num);
    setMinutes(num);
    setSeconds(0);

    setIsInfinite(false);
    setIsRunning(false);
  };

  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = minutes * 60 + seconds;
  const targetTotalSeconds = targetMinutes * 60;

  const progressPercentage = isInfinite
    ? (totalSeconds % 3600) / 36
    : targetTotalSeconds > 0
      ? ((targetTotalSeconds - totalSeconds) / targetTotalSeconds) * 100
      : 0;

  // Flip animation effect
  useEffect(() => {
    const prevM = prevMinsStrRef.current;
    const prevS = prevSecsStrRef.current;
    
    const newFlippingMins = new Set<number>();
    if (minsStr.length !== prevM.length) {
      for(let i=0; i<minsStr.length; i++) newFlippingMins.add(i);
    } else {
      for(let i=0; i<minsStr.length; i++) {
        if (minsStr[i] !== prevM[i]) newFlippingMins.add(i);
      }
    }

    const newFlippingSecs = new Set<number>();
    if (secsStr.length !== prevS.length) {
      for(let i=0; i<secsStr.length; i++) newFlippingSecs.add(i);
    } else {
      for(let i=0; i<secsStr.length; i++) {
        if (secsStr[i] !== prevS[i]) newFlippingSecs.add(i);
      }
    }

    let flipped = false;
    if (newFlippingMins.size > 0) { setFlippingMins(newFlippingMins); flipped = true; }
    if (newFlippingSecs.size > 0) { setFlippingSecs(newFlippingSecs); flipped = true; }

    prevMinsStrRef.current = minsStr;
    prevSecsStrRef.current = secsStr;

    if (flipped) {
      const timeout = setTimeout(() => {
        setFlippingMins(new Set());
        setFlippingSecs(new Set());
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [minsStr, secsStr]);

  const SOUND_OPTIONS = [
    { name: 'Kuş Cıvıltısı', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_1.mp4' },
    { name: 'Akarsu', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_2.mp4' },
    { name: 'Nehir', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_3.mp4' },
    { name: 'Kamp', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_4.mp4' },
    { name: 'Uzay', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_5.mp4' },
    { name: 'Şömine', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_6.mp4' },
    { name: 'Göl', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_7.mp4' },
    { name: 'Okyanus', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_8.mp4' },
    { name: 'Sağanak', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_9.mp4' },
    { name: 'Yağmur', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_10.mp4' },
    { name: 'Dalga', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_11.mp4' },
    { name: 'Kar', url: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_12.mp4' },
  ];

  const PRESET_TIMES = [15, 25, 45, 60];

  // Flip Digit Component with Smooth Animation
  const FlipDigit = ({ digit, isFlipping }: { digit: string; isFlipping: boolean }) => (
    <div className="relative w-36 h-56 sm:w-48 sm:h-72 md:w-56 md:h-[380px]" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-full bg-gradient-to-b from-[#2d2d2d] via-[#252525] to-[#1d1d1d] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-white/5 transition-all duration-600 ${isFlipping ? 'animate-flip' : ''
          }`}
        style={{
          transformStyle: 'preserve-3d',
          animation: isFlipping ? 'flipCard 0.6s ease-in-out' : 'none'
        }}
      >
        {/* Üst Yarım - Sabit kalır */}
        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
          <div className="relative w-full h-full bg-gradient-to-b from-[#323232] to-[#282828] border-b-2 border-black/80">
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span
                className="text-[120px] sm:text-[160px] md:text-[210px] font-bold text-[#e0e0e0] font-mono select-none leading-none"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  transform: 'translateY(50%)'
                }}
              >
                {digit}
              </span>
            </div>
            {/* Defter Delikleri - Üstte (Sabit) */}
            <div className="absolute top-5 left-0 w-full flex justify-center gap-8 opacity-40">
              <div className="w-3 h-3 rounded-full bg-black border border-white/10 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-black border border-white/10 shadow-inner"></div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Alt Yarım - Aşağıdan yukarıya açılan defter efekti */}
        <div
          className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden origin-top"
          style={{
            animation: isFlipping ? 'notebookFlip 0.5s ease-out' : 'none',
            transformOrigin: 'top center'
          }}
        >
          <div className="relative w-full h-full bg-gradient-to-b from-[#252525] to-[#1a1a1a]">
            <div className="absolute inset-0 flex items-start justify-center pt-2">
              <span
                className="text-[120px] sm:text-[160px] md:text-[210px] font-bold text-[#e0e0e0] font-mono select-none leading-none"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  transform: 'translateY(-50%)'
                }}
              >
                {digit}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>

        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black/60 -translate-y-1/2 z-10"></div>
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none"></div>
      </div>
    </div >
  );

  const FullScreenDigitalClock = () => (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <style jsx>{`
        @keyframes notebookFlip {
          0% { transform: scaleY(0); opacity: 0.7; }
          60% { transform: scaleY(1.02); }
          100% { transform: scaleY(1); opacity: 1; }
        }

        @media (orientation: portrait) {
          .forced-landscape {
            width: 100vh !important;
            width: 100dvh !important;
            height: 100vw !important;
            height: 100dvw !important;
            transform-origin: top left !important;
            transform: rotate(90deg) translateY(-100%) !important;
          }
        }
        @media (orientation: landscape) {
          .forced-landscape {
            width: 100vw !important;
            width: 100dvw !important;
            height: 100vh !important;
            height: 100dvh !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Main Container - Always a Landscape Box */}
      <div className="forced-landscape absolute top-0 left-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-black w-full h-full">
        
        {/* Close Button - Top Right */}
        <button
          onClick={() => setShowDigital(false)}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-dark-bg-secondary/50 hover:bg-dark-bg-secondary border border-warm-beige/20 flex items-center justify-center transition-all group z-20"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warm-beige/70 group-hover:text-warm-beige transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Center Content: Clock (Top) + Controls (Bottom) */}
        <div className="flex flex-col items-center justify-center gap-8 md:gap-12 w-full max-w-4xl">
           
           {/* Clock with Labels */}
           <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 scale-[0.80] sm:scale-[0.85] md:scale-95 lg:scale-100">
             
             {/* Minutes */}
             <div className="flex flex-col items-center">
               <div className="text-warm-beige/40 text-xs font-bold tracking-[0.2em] mb-4">DAKİKA</div>
               <div className="flex gap-1 sm:gap-2">
                 {minsStr.split('').map((d, i) => (
                    <FlipDigit key={`min-${i}`} digit={d} isFlipping={flippingMins.has(i)} />
                 ))}
               </div>
             </div>

             {/* Colon */}
             <div className="flex flex-col gap-4 sm:gap-5 px-1 sm:px-2 mt-8">
               <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-warm-beige/60 rounded-full shadow-[0_0_15px_rgba(218,165,105,0.3)]"></div>
               <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-warm-beige/60 rounded-full shadow-[0_0_15px_rgba(218,165,105,0.3)]"></div>
             </div>

             {/* Seconds */}
             <div className="flex flex-col items-center">
               <div className="text-warm-beige/40 text-xs font-bold tracking-[0.2em] mb-4">SANİYE</div>
               <div className="flex gap-1 sm:gap-2">
                 {secsStr.split('').map((d, i) => (
                    <FlipDigit key={`sec-${i}`} digit={d} isFlipping={flippingSecs.has(i)} />
                 ))}
               </div>
             </div>
           </div>

           {/* Controls Row (Buttons + Ambient Sound) */}
           <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 z-20 w-full px-4 flex-wrap">
              
              {/* Play/Pause Button */}
              <button onClick={isRunning ? handlePause : handleStart} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isRunning ? 'bg-warm-beige/20 text-warm-light' : 'bg-dark-bg-secondary text-warm-beige border border-warm-beige/30'}`}>
                {isRunning ? (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>

              {/* Finish Button */}
              <button onClick={handleFinish} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-dark-bg-secondary/40 hover:bg-dark-bg-secondary/60 border border-warm-beige/30 hover:border-warm-beige/50 flex items-center justify-center transition-all text-warm-light">
                 <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              </button>

              {/* Reset Button */}
              <button onClick={handleReset} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-dark-bg-secondary/40 hover:bg-dark-bg-secondary/60 border border-warm-beige/30 hover:border-warm-beige/50 flex items-center justify-center transition-all text-warm-orange group">
                 <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>

              {/* Ses Kontrolü (Ambient Sound) */}
              <div className="relative flex items-center gap-1 min-w-[180px] max-w-xs" ref={fsSoundMenuRef}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/login');
                      return;
                    }
                    if (currentSoundName === 'YouTube') {
                      setIsYoutubePlaying(!isYoutubePlaying);
                    } else {
                      toggleSound();
                    }
                  }}
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-l-xl font-semibold transition flex items-center gap-2 border shadow-soft flex-1 ${(currentSoundName === 'YouTube' ? isYoutubePlaying : isSoundPlaying)
                    ? 'bg-warm-beige/10 text-warm-beige border-warm-beige/30'
                    : 'bg-dark-bg-secondary/80 text-text-medium border-white/10 hover:border-warm-beige/20 hover:text-warm-beige'
                    }`}
                >
                  {(currentSoundName === 'YouTube' ? isYoutubePlaying : isSoundPlaying) ? (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                  <span className="truncate text-sm sm:text-base">{currentSoundName}</span>
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/login');
                      return;
                    }
                    setShowSoundMenu(!showSoundMenu);
                  }}
                  className={`h-12 sm:h-14 px-3 rounded-r-xl border-t border-b border-r transition flex items-center justify-center shadow-soft ${(currentSoundName === 'YouTube' ? isYoutubePlaying : isSoundPlaying)
                    ? 'bg-warm-beige/10 text-warm-beige border-warm-beige/30 border-l border-l-warm-beige/20'
                    : 'bg-dark-bg-secondary/80 text-text-medium border-white/10 hover:border-warm-beige/20 hover:text-warm-beige border-l border-l-white/10'
                    }`}
                >
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showSoundMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu - Opens UPWARDS because it's at the bottom */}
                {showSoundMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-full glass border border-warm-beige/10 rounded-xl shadow-soft-lg overflow-hidden z-30 p-2">
                    <div className="px-3 py-3 border-b border-white/5 mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0" max="1" step="0.05"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="flex-1 h-1 bg-dark-bg-darker rounded-full appearance-none cursor-pointer accent-warm-beige"
                        />
                        <span className="text-[10px] text-text-medium w-6 text-right">{Math.round(volume * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {SOUND_OPTIONS.map((sound) => (
                        <button
                          key={sound.name}
                          onClick={() => {
                            if (currentSoundName === sound.name) {
                              toggleSound();
                            } else {
                              handleSoundSelect(sound.name, sound.url);
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full ${currentSoundName === sound.name
                            ? 'bg-warm-beige/20 text-warm-beige font-semibold'
                            : 'text-text-medium hover:bg-white/5 hover:text-warm-beige'
                            }`}
                        >
                          {sound.name}
                          {currentSoundName === sound.name && isSoundPlaying && (
                            <div className="flex gap-0.5 items-end h-3">
                              <div className="w-1 h-full bg-warm-beige animate-[bounce_1s_infinite]"></div>
                              <div className="w-1 h-2/3 bg-warm-beige animate-[bounce_1s_infinite_0.2s]"></div>
                              <div className="w-1 h-full bg-warm-beige animate-[bounce_1s_infinite_0.4s]"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-dark-bg-primary text-text-light flex flex-col items-center justify-center px-4 py-8 font-sans">

      {showDigital && <FullScreenDigitalClock />}

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-evenly gap-12 w-full max-w-7xl">

        <div className="flex flex-col items-center w-full lg:w-auto">

          {/* Timer Circle */}
          <div className="relative w-80 h-80 mb-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" stroke="currentColor" className="text-white/5" strokeWidth="8" fill="none" />
              <circle
                cx="100" cy="100" r="90"
                className="text-warm-beige transition-all duration-1000 ease-linear"
                stroke="currentColor" strokeWidth="8" fill="none"
                strokeDasharray={`${(Math.PI * 180 * progressPercentage) / 100} ${Math.PI * 180}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-bold text-warm-beige font-mono tracking-wider">{timeString}</div>
              <div className="text-sm text-text-medium mt-2 font-medium">
                {isInfinite ? 'Çalışma Süresi (Sonsuz)' : 'Çalışma Süresi'}
              </div>
            </div>
          </div>

          {/* Control Buttons - Dark Theme Uyumlu */}
          <div className="flex flex-row flex-nowrap sm:flex-wrap justify-center gap-2 sm:gap-4 mb-8 w-full max-w-lg px-2">
            <button
              onClick={isRunning ? handlePause : handleStart}
              className={`px-4 sm:px-8 py-3.5 rounded-xl font-bold transition flex flex-1 sm:flex-none items-center justify-center gap-2 shadow-soft border border-warm-beige/20 hover:border-warm-beige/40 hover:scale-105 transform active:scale-95 bg-dark-bg-secondary hover:bg-warm-dark ${
                isRunning ? 'text-warm-light' : 'text-warm-beige'
              }`}
            >
              {isRunning ? (
                <><svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg> <span className="hidden sm:inline">Duraklat</span></>
              ) : (
                <><svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> <span className="hidden sm:inline">Başlat</span></>
              )}
            </button>
            <button
              onClick={handleFinish}
              className="px-4 sm:px-8 py-3.5 rounded-xl font-bold bg-dark-bg-secondary hover:bg-warm-dark text-warm-light border border-warm-beige/20 hover:border-warm-beige/40 transition flex flex-1 sm:flex-none items-center justify-center gap-2 shadow-soft hover:scale-105 transform active:scale-95"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg> <span className="hidden sm:inline">Bitir</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 sm:px-8 py-3.5 rounded-xl font-bold bg-dark-bg-secondary hover:bg-warm-dark text-warm-orange border border-warm-beige/20 hover:border-warm-beige/40 transition flex flex-1 sm:flex-none items-center justify-center gap-2 shadow-soft hover:scale-105 transform active:scale-95 group"
            >
              <svg className="w-5 h-5 flex-shrink-0 group-hover:-rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> <span className="hidden sm:inline">Sıfırla</span>
            </button>
            <button
              onClick={() => setShowDigital(true)}
              className="px-4 sm:px-8 py-3.5 rounded-xl font-bold transition flex flex-1 sm:flex-none items-center justify-center gap-2 shadow-soft border border-warm-beige/20 bg-dark-bg-secondary hover:bg-warm-dark text-warm-beige hover:border-warm-beige/40 hover:scale-105 transform active:scale-95"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15h2v2H8v-2zm4 0h2v2h-2v-2zm-4-4h2v2H8v-2zm4 0h2v2h-2v-2z" /></svg> <span className="hidden sm:inline">Dijital</span>
            </button>
          </div>

          {/* Ses Kontrolü */}
          <div className="relative mb-8 flex items-center gap-1 w-full max-w-xs" ref={soundMenuRef}>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                  return;
                }
                if (currentSoundName === 'YouTube') {
                  setIsYoutubePlaying(!isYoutubePlaying);
                } else {
                  toggleSound();
                }
              }}
              className={`h-12 px-6 rounded-l-xl font-semibold transition flex items-center gap-2 border shadow-soft flex-1 ${(currentSoundName === 'YouTube' ? isYoutubePlaying : isSoundPlaying)
                ? 'bg-warm-beige/10 text-warm-beige border-warm-beige/30'
                : 'bg-dark-bg-secondary text-text-medium border-white/10 hover:border-warm-beige/20 hover:text-warm-beige'
                }`}
            >
              {(currentSoundName === 'YouTube' ? isYoutubePlaying : isSoundPlaying) ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
              <span className="truncate">{currentSoundName}</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                  return;
                }
                setShowSoundMenu(!showSoundMenu);
              }}
              className={`h-12 px-3 rounded-r-xl border-t border-b border-r transition flex items-center justify-center shadow-soft ${(currentSoundName === 'YouTube' ? isYoutubePlaying : isSoundPlaying)
                ? 'bg-warm-beige/10 text-warm-beige border-warm-beige/30 border-l border-l-warm-beige/20'
                : 'bg-dark-bg-secondary text-text-medium border-white/10 hover:border-warm-beige/20 hover:text-warm-beige border-l border-l-white/10'
                }`}
            >
              <svg className={`w-4 h-4 transition-transform ${showSoundMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSoundMenu && (
              <div className="absolute top-full left-0 mt-2 w-full glass border border-warm-beige/10 rounded-xl shadow-soft-lg overflow-hidden z-20 p-2">
                <div className="px-3 py-3 border-b border-white/5 mb-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0" max="1" step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-dark-bg-darker rounded-full appearance-none cursor-pointer accent-warm-beige"
                    />
                    <span className="text-[10px] text-text-medium w-6 text-right">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {SOUND_OPTIONS.map((sound) => (
                    <button
                      key={sound.name}
                      onClick={() => handleSoundSelect(sound.name, sound.url)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition group ${currentSoundName === sound.name
                        ? 'bg-warm-beige/10 text-warm-beige'
                        : 'text-text-light hover:bg-dark-bg-secondary'
                        }`}
                    >
                      <span className="text-xs font-medium">{sound.name}</span>
                      {currentSoundName === sound.name && <div className="w-1.5 h-1.5 bg-warm-beige rounded-full"></div>}
                    </button>
                  ))}

                  {/* YouTube Option */}
                  <button
                    onClick={() => handleSoundSelect('YouTube', '')}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition group shrink-0 ${currentSoundName === 'YouTube'
                      ? 'bg-red-500/10 text-red-400'
                      : 'text-text-light hover:bg-dark-bg-secondary'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                      <span className="text-xs font-medium">YouTube</span>
                    </div>
                    {currentSoundName === 'YouTube' && <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>}
                  </button>

                  {/* YouTube Input Loop (Only if YouTube is selected) */}
                  {currentSoundName === 'YouTube' && (
                    <div className="px-1 py-2 border-t border-white/5 mt-1 space-y-2">
                      {/* Input ve Güncelle */}
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={youtubeInput}
                          onChange={(e) => setYoutubeInput(e.target.value)}
                          placeholder={youtubeId ? "Link değiştir..." : "YouTube linki..."}
                          className="flex-1 bg-dark-bg-darker border border-white/5 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-red-400/50"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleYoutubeUpdate();
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] px-2 rounded border border-red-500/20 transition"
                        >
                          OK
                        </button>
                      </div>

                      {/* Play/Pause Kontrolü - ID yerine */}
                      {youtubeId && (
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[9px] text-white/40">Oynatılıyor</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsYoutubePlaying(!isYoutubePlaying);
                            }}
                            className={`p-1.5 rounded transition ${isYoutubePlaying ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                          >
                            {isYoutubePlaying ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sonsuz Mod */}
          <div className="flex items-center gap-3 bg-dark-bg-secondary/30 px-5 py-2 rounded-full border border-white/5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isInfinite} onChange={(e) => {
                if (!isAuthenticated) {
                  router.push('/login');
                  return;
                }
                setIsInfinite(e.target.checked); if (!e.target.checked) { setMinutes(targetMinutes); setSeconds(0); } else { setMinutes(0); setSeconds(0); totalMinutesRef.current = 0; } setIsRunning(false);
              }} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-warm-beige"></div>
            </label>
            <span className="text-[10px] text-text-medium uppercase tracking-widest">Sonsuz Mod</span>
          </div>
        </div>

        {/* Ayarla Paneli */}
        <div className="w-full lg:w-72 glass border border-warm-beige/10 rounded-2xl p-6 shadow-soft-lg flex flex-col gap-5 lg:h-80 justify-center">
          <h2 className="text-xl font-semibold text-warm-beige font-serif border-b border-white/5 pb-3">Ayarla</h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-medium uppercase tracking-wider font-semibold">Süre (Dakika)</label>
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                className="w-full bg-dark-bg-darker border-2 border-warm-beige/30 focus:border-warm-beige/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-warm-beige/20 transition-all outline-none text-xl text-center font-mono caret-transparent"
                placeholder="15"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {PRESET_TIMES.map(time => (
                <button
                  key={time}
                  onClick={() => handlePresetClick(time)}
                  className={`py-2 rounded-lg text-sm font-medium transition border ${inputValue === String(time)
                    ? 'bg-warm-beige/10 text-warm-beige border-warm-beige/30'
                    : 'bg-dark-bg-secondary text-text-medium border-white/5 hover:bg-dark-bg-secondary/80 hover:border-warm-beige/20'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                  return;
                }
                handleApplySettings();
              }}
              className="w-full py-3.5 bg-warm-dark hover:bg-warm-beige text-dark-bg-primary rounded-xl font-bold transition shadow-soft flex items-center justify-center gap-2 mt-2 hover:scale-[1.02] transform active:scale-95"
            >
              Uygula
            </button>
          </div>
        </div>

      </div>

      {/* Hidden YouTube Player */}
      {currentSoundName === 'YouTube' && youtubeId && (
        <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            width="1"
            height="1"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=1&modestbranding=1&rel=0&enablejsapi=1`}
            title="YouTube Ambiyans"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
    </main>
  );
}
