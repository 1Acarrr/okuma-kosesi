'use client';

import React from 'react';
import { useTimer } from '@hooks/useTimer';

interface FocusTimerProps {
  initialMinutes?: number;
  onSessionComplete?: (durationMinutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  initialMinutes = 25,
  onSessionComplete,
}) => {
  const timer = useTimer(initialMinutes);

  React.useEffect(() => {
    if (timer.minutes === 0 && timer.seconds === 0 && !timer.isActive) {
      onSessionComplete?.(initialMinutes);
    }
  }, [timer.minutes, timer.seconds, timer.isActive, initialMinutes, onSessionComplete]);

  const timeString = `${String(timer.minutes).padStart(2, '0')}:${String(
    timer.seconds
  ).padStart(2, '0')}`;

  const progressPercentage = ((initialMinutes * 60 - (timer.minutes * 60 + timer.seconds)) / (initialMinutes * 60)) * 100;

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-8 text-center backdrop-blur">
      <h2 className="text-xl font-semibold mb-6 text-slate-100">Odak Modu</h2>

      {/* Timer Display */}
      <div className="mb-8">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#334155"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(Math.PI * 180 * progressPercentage) / 100} ${Math.PI * 180}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-blue-400 font-mono">
              {timeString}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={timer.toggle}
          className={`px-8 py-3 rounded-lg font-semibold transition ${
            timer.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {timer.isActive ? '⏸ Durdur' : '▶ Başlat'}
        </button>
        <button
          onClick={timer.reset}
          className="px-8 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100 transition"
        >
          ↻ Sıfırla
        </button>
      </div>

      {/* Time Presets */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[15, 25, 45, 60].map((minutes) => (
          <button
            key={minutes}
            onClick={() => timer.setMinutes(minutes)}
            disabled={timer.isActive}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              timer.minutes === minutes && timer.seconds === 0
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
            }`}
          >
            {minutes}d
          </button>
        ))}
      </div>
    </div>
  );
};
