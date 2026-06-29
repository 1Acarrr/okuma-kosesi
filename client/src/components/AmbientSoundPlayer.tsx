'use client';

import React from 'react';
import { AmbientSound } from '../types/index';
import { useAudioPlayer } from '@hooks/useAudioPlayer';

interface AmbientSoundPlayerProps {
  sound: AmbientSound;
  isSelected?: boolean;
  onSelect?: (sound: AmbientSound) => void;
}

// Icon mapping for elegant icons
const getSoundIcon = (soundId: string, name: string) => {
  const id = soundId.toLowerCase();
  const soundName = name.toLowerCase();

  if (id.includes('rain') || soundName.includes('yağmur')) {
    return 'Yağmur Sesi';
  } else if (id.includes('fire') || soundName.includes('ateş') || soundName.includes('şömine')) {
    return 'Şömine Sesi';
  } else if (id.includes('wind') || soundName.includes('rüzgar')) {
    return 'Rüzgar Sesi';
  } else if (id.includes('forest') || soundName.includes('orman')) {
    return 'Orman Sesi';
  } else if (id.includes('ocean') || soundName.includes('deniz') || soundName.includes('dalga')) {
    return 'Deniz Sesi';
  } else if (id.includes('coffee') || soundName.includes('kahve')) {
    return 'Kahve Sesi';
  } else {
    return 'Diğer Sesler';
  }
};

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({
  sound,
  isSelected = false,
  onSelect,
}) => {
  const { isPlaying, togglePlay, volume, setVolume } = useAudioPlayer(sound.source);
  const icon = getSoundIcon(sound.id, sound.name);

  return (
    <div
      className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 shadow-soft ${isSelected
          ? 'border-warm-beige bg-warm-beige/10 shadow-soft-lg'
          : 'border-warm-beige/20 bg-dark-bg-secondary/50 hover:border-warm-beige/40 hover:bg-dark-bg-secondary/70'
        } ${isPlaying ? 'ring-2 ring-warm-beige/30' : ''}`}
      onClick={() => onSelect?.(sound)}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 187, 163, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '';
        }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`text-3xl transition-all duration-300 ${isPlaying ? 'scale-110 filter drop-shadow-[0_0_8px_rgba(212,187,163,0.6)]' : ''
            }`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-warm-beige text-lg mb-1">{sound.name}</h3>
            <p className="text-sm text-text-medium">{sound.description}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-soft ${isPlaying
              ? 'bg-warm-beige/20 hover:bg-warm-beige/30 text-warm-beige border border-warm-beige/30'
              : 'bg-warm-beige hover:bg-warm-light text-dark-bg-primary border border-warm-beige/20'
            }`}
        >
          {isPlaying ? '⏸ Durdur' : '▶ Oynat'}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-text-medium font-medium">Ses:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 h-1.5 bg-dark-bg-primary rounded-full appearance-none cursor-pointer accent-warm-beige caret-transparent"
          style={{
            background: `linear-gradient(to right, #d4bba3 0%, #d4bba3 ${volume * 100}%, #1a1a1a ${volume * 100}%, #1a1a1a 100%)`,
          }}
        />
        <span className="text-xs text-text-medium w-10 text-right font-medium">
          {Math.round(volume * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs px-3 py-1 rounded-full bg-warm-beige/10 text-warm-beige border border-warm-beige/20">
          {sound.category}
        </span>
        <a
          href="#"
          className="text-xs text-text-medium hover:text-warm-beige transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {sound.license}
        </a>
      </div>
    </div>
  );
};
