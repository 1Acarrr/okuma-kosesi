import React, { useState } from 'react';
import { VideoAmbientCard, VideoAmbientItem } from '../components/VideoAmbientCard';
import { VideoModal } from '../components/VideoModal';
import { PersistentYoutubeAmbience } from '../components/PersistentYoutubeAmbience';

import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store';

const VIDEO_AMBIENTS: VideoAmbientItem[] = [
  // ... (Video Ambients Listesi aynı kalacak)
  { id: 'video-1', name: 'Kuş Cıvıltısı', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_1.mp4' },
  { id: 'video-2', name: 'Akarsu', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_2.mp4' },
  { id: 'video-3', name: 'Nehir', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_3.mp4' },
  { id: 'video-4', name: 'Kamp', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_4.mp4' },
  { id: 'video-5', name: 'Uzay', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_5.mp4' },
  { id: 'video-6', name: 'Şömine', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_6.mp4' },
  { id: 'video-7', name: 'Göl', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_7.mp4' },
  { id: 'video-8', name: 'Okyanus', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_8.mp4' },
  { id: 'video-9', name: 'Sağanak', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_9.mp4' },
  { id: 'video-10', name: 'Yağmur', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_10.mp4' },
  { id: 'video-11', name: 'Dalga', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_11.mp4' },
  { id: 'video-12', name: 'Kar', videoSrc: 'https://kaecenmrjpucdkbddodz.supabase.co/storage/v1/object/public/ambience-media/library/video_12.mp4' },
];

export default function FocusPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const [selectedVideo, setSelectedVideo] = useState<VideoAmbientItem | null>(null);

  const handleSelectCard = (item: VideoAmbientItem) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedVideo(item);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <main className="min-h-screen bg-dark-bg-primary px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-warm-beige">
          Ortam Seç
        </h2>
        <p className="text-text-medium mb-10 uppercase tracking-[0.3em] text-[10px] font-light">Kütüphaneden şeçin veya kendi linkinizi ekleyin</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEO_AMBIENTS.map((item) => (
            <VideoAmbientCard
              key={item.id}
              item={item}
              isActive={selectedVideo?.id === item.id}
              onSelect={() => handleSelectCard(item)}
            />
          ))}
        </div>

        <PersistentYoutubeAmbience />
      </div>

      {/* Video Modal */}
      <VideoModal
        item={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={handleCloseVideo}
      />
    </main>
  );
}
