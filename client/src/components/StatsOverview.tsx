'use client';

import React from 'react';
import { ReadingSummary } from '../types/index';

interface StatsOverviewProps {
  stats: ReadingSummary | null;
  isLoading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-dark-bg-secondary/40 border border-warm-beige/10 rounded-[32px] p-8 animate-pulse">
        <div className="h-6 bg-warm-beige/5 rounded-full mb-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-warm-beige/5 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-dark-bg-secondary/40 backdrop-blur-md border border-warm-beige/10 rounded-[32px] p-8 shadow-2xl">
      <h3 className="text-xl font-black mb-8 text-warm-light tracking-tight flex items-center gap-3">
        <span className="w-8 h-8 rounded-xl bg-warm-beige/10 flex items-center justify-center text-warm-beige">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </span>
        Genel Özet
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Books */}
        <div className="bg-dark-bg-primary/40 border border-warm-beige/5 rounded-3xl p-6 hover:border-warm-beige/20 transition-all group">
          <p className="text-[10px] text-warm-beige/50 uppercase font-black tracking-widest mb-2">Okunan Kitaplar</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white group-hover:text-warm-light transition-colors">{stats.totalBooksRead}</p>
            <span className="text-xs text-warm-beige/40 font-bold uppercase tracking-tighter">Eser</span>
          </div>
        </div>

        {/* Total Reading Time */}
        <div className="bg-dark-bg-primary/40 border border-warm-beige/5 rounded-3xl p-6 hover:border-warm-beige/20 transition-all group">
          <p className="text-[10px] text-warm-beige/50 uppercase font-black tracking-widest mb-2">Toplam Odaklanma</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white group-hover:text-warm-light transition-colors">
              {Math.floor(stats.totalReadingMinutes / 60)}<span className="text-xl text-warm-beige/40 ml-1">sa</span> {stats.totalReadingMinutes % 60}<span className="text-xl text-warm-beige/40 ml-1">dk</span>
            </p>
          </div>
        </div>
      </div>

      {/* Most Read Book */}
      {stats.mostReadBook && (
        <div className="mt-6 p-6 bg-gradient-to-br from-warm-beige/[0.03] to-transparent border border-warm-beige/10 rounded-3xl">
          <p className="text-[10px] text-warm-beige/30 uppercase font-black tracking-widest mb-3">En Çok Vakit Geçirilen Eser</p>
          <p className="text-xl font-bold text-warm-light mb-1">{stats.mostReadBook.title}</p>
          <p className="text-sm text-warm-beige/40 font-serif italic">
            Bu eserle toplam {Math.floor(stats.mostReadBook.minutes / 60)} saat {stats.mostReadBook.minutes % 60} dakika paylaştınız.
          </p>
        </div>
      )}
    </div>
  );
};
