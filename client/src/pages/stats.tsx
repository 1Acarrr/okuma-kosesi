import React, { useState, useEffect } from 'react';
import { StatsOverview } from '../components/StatsOverview';
import { ReadingHeatmap } from '../components/ReadingHeatmap';
import apiClient from '../lib/api';
import { ReadingSummary, DailyStats, WeeklyStats } from '../types/index';

export default function StatsPage() {
  const [summary, setSummary] = useState<ReadingSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  
  // Yearly stats state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearlyStats, setYearlyStats] = useState<{heatmapData: Record<string, number>, availableYears: number[]} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBaseStats();
  }, []);

  useEffect(() => {
    fetchYearlyStats(selectedYear);
  }, [selectedYear]);

  const fetchBaseStats = async () => {
    try {
      const [summaryRes, dailyRes, weeklyRes] = await Promise.all([
        apiClient.get('/stats/summary').catch(() => ({ data: { data: null } })),
        apiClient.get('/stats/daily').catch(() => ({ data: { data: null } })),
        apiClient.get('/stats/weekly').catch(() => ({ data: { data: null } })),
      ]);

      setSummary(summaryRes.data.data);
      setDailyStats(dailyRes.data.data);
      setWeeklyStats(weeklyRes.data.data);
    } catch (error) {
      console.error('Error fetching base stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYearlyStats = async (year: number) => {
    try {
      const res = await apiClient.get(`/stats/yearly?year=${year}`);
      if (res.data && res.data.data) {
        setYearlyStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg-primary text-text-light px-6 py-12 font-sans selection:bg-warm-beige/30">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2">İstatistikler</h1>
            <p className="text-warm-beige/60 font-medium tracking-widest uppercase text-xs">Okuma Verimliliğini İzle</p>
          </div>
        </div>

        {/* Summary Overview */}
        <div className="mb-8">
          <StatsOverview stats={summary} isLoading={isLoading} />
        </div>

        {/* Yearly Heatmap - always render, show empty state while loading */}
        <ReadingHeatmap 
          data={yearlyStats ?? { heatmapData: {}, availableYears: [selectedYear] }}
          selectedYear={selectedYear}
          onYearSelect={setSelectedYear}
          isLoading={!yearlyStats}
        />

        {/* Daily Stats */}
        {dailyStats && (
          <div className="bg-dark-bg-secondary/40 backdrop-blur-md border border-warm-beige/10 rounded-[32px] p-8 mb-8 shadow-2xl">
            <h2 className="text-xl font-black mb-8 text-warm-light tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-warm-beige/10 flex items-center justify-center text-warm-beige">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </span>
              Günün Özeti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-bg-primary/40 border border-warm-beige/5 rounded-3xl p-6 group hover:border-warm-beige/20 transition-all">
                <p className="text-[10px] text-warm-beige/50 uppercase font-black tracking-widest mb-2">Okuma Süresi</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white group-hover:text-warm-light transition-colors">{dailyStats.totalMinutes}</p>
                  <span className="text-xs text-warm-beige/40 font-bold uppercase tracking-tighter">Dakika</span>
                </div>
              </div>
              <div className="bg-dark-bg-primary/40 border border-warm-beige/5 rounded-3xl p-6 group hover:border-warm-beige/20 transition-all">
                <p className="text-[10px] text-warm-beige/50 uppercase font-black tracking-widest mb-2">Etkileşimdeki Kitaplar</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white group-hover:text-warm-light transition-colors">{dailyStats.booksRead}</p>
                  <span className="text-xs text-warm-beige/40 font-bold uppercase tracking-tighter">Adet</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Stats */}
        {weeklyStats && (
          <div className="bg-dark-bg-secondary/40 backdrop-blur-md border border-warm-beige/10 rounded-[32px] p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-8 text-warm-light tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-warm-beige/10 flex items-center justify-center text-warm-beige">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              </span>
              Haftalık Seyir
            </h2>

            <div className="mb-10 text-center md:text-left">
              <p className="text-5xl font-black text-white mb-2 tracking-tighter">
                {Math.floor(weeklyStats.totalMinutes / 60)}<span className="text-2xl text-warm-beige/40 ml-1">sa</span> {weeklyStats.totalMinutes % 60}<span className="text-2xl text-warm-beige/40 ml-1">dk</span>
              </p>
              <p className="text-[10px] text-warm-beige/50 uppercase font-black tracking-widest">Haftalık Toplam Odaklanma</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr'].map((day, idx) => {
                const date = new Date();
                // Pazartesiyi başlangıç yapacak şekilde ayarlar (JS getDay: 0 Pazar, 1 Pazartesi...)
                const currentDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
                date.setDate(date.getDate() - (currentDay - idx));
                const dateStr = date.toISOString().split('T')[0];
                const minutes = weeklyStats.dailyBreakdown[dateStr] || 0;

                return (
                  <div key={idx} className="bg-dark-bg-primary/40 border border-warm-beige/5 rounded-2xl p-4 flex flex-col items-center group hover:border-warm-beige/40 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute inset-0 bg-warm-beige/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[9px] text-warm-beige/30 uppercase font-black tracking-tighter mb-3 relative z-10">{day}</p>
                    <div className="relative z-10">
                      <p className={`text-xl font-black tracking-tighter transition-colors ${minutes > 0 ? 'text-warm-beige' : 'text-warm-beige/10'}`}>
                        {minutes > 0 ? `${minutes}m` : '0m'}
                      </p>
                      {minutes > 0 && (
                        <div className="w-1 h-1 bg-warm-beige rounded-full mx-auto mt-2 shadow-[0_0_8px_rgba(218,165,105,0.6)] animate-pulse"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
