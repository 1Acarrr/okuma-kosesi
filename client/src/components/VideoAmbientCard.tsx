'use client';

import React, { useRef } from 'react';

export interface VideoAmbientItem {
  id: string;
  name: string;
  videoSrc: string;
}

interface VideoAmbientCardProps {
  item: VideoAmbientItem;
  isActive: boolean;
  onSelect: () => void;
}

export const VideoAmbientCard: React.FC<VideoAmbientCardProps> = ({
  item,
  isActive,
  onSelect,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      onClick={onSelect}
      className={`relative aspect-video rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
        isActive
          ? 'border-warm-beige ring-2 ring-warm-beige/30 shadow-soft-lg scale-[1.02]'
          : 'border-warm-beige/20 hover:border-warm-beige/40 shadow-soft'
      }`}
    >
      <video
        ref={videoRef}
        src={item.videoSrc}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-serif font-semibold text-lg text-warm-beige drop-shadow-lg">
          {item.name}
        </h3>
      </div>
    </div>
  );
};
