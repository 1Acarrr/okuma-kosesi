import { useEffect, useRef } from 'react';
import apiClient from '../lib/api';

export const useFocusSession = (isRunning: boolean, isInfinite: boolean) => {
  const lastSavedMinuteRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const minuteCounterRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      // Her dakika (60 saniye) geçtiğinde kaydet
      intervalRef.current = setInterval(async () => {
        minuteCounterRef.current += 1;
        
        try {
          await apiClient.post('/stats/focus-session', {
            durationMinutes: 1,
            isInfinite,
          });
          lastSavedMinuteRef.current = minuteCounterRef.current;
        } catch (error) {
          console.error('Failed to save focus session:', error);
        }
      }, 60000); // Her 60 saniyede bir
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Timer durduğunda sıfırla
      if (!isRunning) {
        minuteCounterRef.current = 0;
        lastSavedMinuteRef.current = 0;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isInfinite]);
};
