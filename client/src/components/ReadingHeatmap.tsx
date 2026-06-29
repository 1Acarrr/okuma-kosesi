import React, { useMemo } from 'react';

interface YearlyData {
  heatmapData: Record<string, number>;
  availableYears: number[];
}

interface ReadingHeatmapProps {
  data: YearlyData;
  selectedYear: number;
  onYearSelect: (year: number) => void;
  isLoading?: boolean;
}

// Local-timezone-safe date string: "YYYY-MM-DD"
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr'];

// Cell size + gap (must match CSS below)
const CELL_SIZE = 14;  // w-[14px]
const CELL_GAP  = 4;   // gap-1 = 4px
const COL_WIDTH = CELL_SIZE + CELL_GAP; // 18px per week column

export const ReadingHeatmap: React.FC<ReadingHeatmapProps> = ({
  data,
  selectedYear,
  onYearSelect,
  isLoading = false,
}) => {
  const { heatmapData, availableYears } = data;

  // ── 1. Build day list for the selected year ──────────────────────────────
  const days = useMemo(() => {
    const result: { dateStr: string; minutes: number; date: Date }[] = [];
    const start = new Date(selectedYear, 0, 1);   // Jan 1
    const end   = new Date(selectedYear, 11, 31); // Dec 31

    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
      const d   = new Date(cur);
      const str = toLocalDateStr(d);
      result.push({ dateStr: str, minutes: heatmapData[str] || 0, date: d });
    }
    return result;
  }, [heatmapData, selectedYear]);

  // ── 2. Build week columns + month labels (GitHub layout) ─────────────────
  const { weeks, monthLabels } = useMemo(() => {
    type Cell = { dateStr: string; minutes: number; date: Date } | null;
    const cols: Cell[][] = [];
    let currentCol: Cell[] = [];

    // Monday-first: getDay() → 0=Sun,1=Mon,...,6=Sat  →  Mon=0, ..., Sun=6
    const toMondayFirst = (jsDay: number) => (jsDay === 0 ? 6 : jsDay - 1);

    // Pad first column so Jan 1 lands on the correct row
    if (days.length > 0) {
      const pad = toMondayFirst(days[0].date.getDay());
      for (let i = 0; i < pad; i++) currentCol.push(null);
    }

    const labels: { label: string; weekIndex: number }[] = [];
    let trackedMonth = -1;

    for (const day of days) {
      // New month → record which column (week) its 1st day lands in
      if (day.date.getMonth() !== trackedMonth) {
        trackedMonth = day.date.getMonth();
        // weekIndex = completed columns + 1 if the 1st isn't at the top of a new column
        // We track the column index that will contain this day
        labels.push({ label: MONTH_NAMES[trackedMonth], weekIndex: cols.length });
      }

      currentCol.push(day);

      if (currentCol.length === 7) {
        cols.push(currentCol);
        currentCol = [];
      }
    }

    // Pad last column
    if (currentCol.length > 0) {
      while (currentCol.length < 7) currentCol.push(null);
      cols.push(currentCol);
    }

    return { weeks: cols, monthLabels: labels };
  }, [days]);

  // ── 3. Intensity ──────────────────────────────────────────────────────────
  const getIntensityClass = (minutes: number) => {
    if (minutes === 0)   return 'bg-warm-beige/5 border-warm-beige/5';
    if (minutes < 15)    return 'bg-warm-beige/20 border-warm-beige/20 shadow-[0_0_8px_rgba(218,165,105,0.1)]';
    if (minutes < 45)    return 'bg-warm-beige/40 border-warm-beige/40 shadow-[0_0_12px_rgba(218,165,105,0.2)]';
    if (minutes < 90)    return 'bg-warm-beige/70 border-warm-beige/60 shadow-[0_0_16px_rgba(218,165,105,0.4)]';
    return 'bg-warm-beige border-warm-light shadow-[0_0_20px_rgba(218,165,105,0.6)]';
  };

  // ── 4. Total minutes (current year) ──────────────────────────────────────
  const totalMinutes = useMemo(
    () => Object.values(heatmapData).reduce((a, b) => a + b, 0),
    [heatmapData],
  );

  // Y-axis label area width (w-6 = 24px) + gap-2 (8px) = 32px
  const Y_AXIS_OFFSET = 32;

  return (
    <div className="bg-dark-bg-secondary/40 backdrop-blur-md border border-warm-beige/10 rounded-[32px] p-8 mb-8 shadow-2xl overflow-hidden flex flex-col lg:flex-row gap-8">

      {/* ── Main Heatmap Area ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-black text-warm-light tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-warm-beige/10 flex items-center justify-center text-warm-beige">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            Okuma Geçmişi
          </h2>
          <div className="text-sm font-medium text-warm-beige/60">
            {isLoading ? (
              <span className="text-warm-beige/40 animate-pulse">Yükleniyor…</span>
            ) : (
              <>
                <span className="text-warm-beige font-black text-lg">{totalMinutes} dakika</span> okuma (bu yıl)
              </>
            )}
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-warm-beige/20 scrollbar-track-transparent">
          <div className="min-w-max">

            {/* Month headers — absolutely positioned within a relative row */}
            <div className="relative h-5 mb-2" style={{ marginLeft: Y_AXIS_OFFSET }}>
              {monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="absolute text-[10px] text-warm-beige/60 font-bold uppercase"
                  style={{ left: m.weekIndex * COL_WIDTH }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Y-axis day labels */}
              <div className="flex flex-col gap-[4px] text-[9px] text-warm-beige/40 font-bold uppercase w-6">
                {DAY_LABELS.map((d) => (
                  <span key={d} className="h-[14px] flex items-center">{d}</span>
                ))}
              </div>

              {/* Week columns */}
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day, di) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${wi}-${di}`}
                            className="w-[14px] h-[14px] rounded-sm bg-transparent"
                          />
                        );
                      }
                      return (
                        <div
                          key={day.dateStr}
                          title={`${day.dateStr}: ${day.minutes} dakika`}
                          className={`w-[14px] h-[14px] rounded-[3px] border transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${getIntensityClass(day.minutes)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-3 text-[10px] text-warm-beige/50 font-bold uppercase tracking-widest pl-8">
          <span>Az</span>
          <div className="flex gap-1.5">
            <div className="w-[14px] h-[14px] rounded-[3px] bg-warm-beige/5  border border-warm-beige/5" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-warm-beige/20 border border-warm-beige/20" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-warm-beige/40 border border-warm-beige/40" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-warm-beige/70 border border-warm-beige/60" />
            <div className="w-[14px] h-[14px] rounded-[3px] bg-warm-beige    border border-warm-light" />
          </div>
          <span>Çok</span>
        </div>
      </div>

      {/* ── Year Selector Sidebar ──────────────────────────────────────── */}
      <div className="w-full lg:w-28 flex flex-row lg:flex-col gap-2 pt-2 lg:pt-16 lg:pl-6 lg:border-l border-warm-beige/10 justify-start overflow-x-auto">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => onYearSelect(year)}
            className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedYear === year
                ? 'bg-warm-beige text-dark-bg-primary shadow-[0_0_15px_rgba(218,165,105,0.4)]'
                : 'text-warm-beige/60 hover:bg-warm-beige/10 hover:text-warm-beige border border-transparent hover:border-warm-beige/20'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};
