import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudioPlayer = (audioUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    // Create a video element instead of an Audio element to better handle MP4 containers
    const audio = document.createElement('video');
    audio.src = audioUrl;
    audio.loop = true;
    audio.volume = volume;
    // Ensure it's not actually displayed or affecting layout
    audio.style.display = 'none';

    audioRef.current = audio;

    // If already playing, automatically start the new source
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Error auto-playing new audio source:', error);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
      audio.load(); // Clean up resources
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  return {
    isPlaying,
    togglePlay,
    volume,
    setVolume: handleVolumeChange,
  };
};
