import { useState, useEffect, useCallback } from 'react';

interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export const useTimer = (initialMinutes: number = 25) => {
  const [state, setState] = useState<TimerState>({
    minutes: initialMinutes,
    seconds: 0,
    isActive: false,
  });

  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  const reset = useCallback(() => {
    setState({
      minutes: initialMinutes,
      seconds: 0,
      isActive: false,
    });
  }, [initialMinutes]);

  const setMinutes = useCallback((minutes: number) => {
    setState({
      minutes,
      seconds: 0,
      isActive: false,
    });
  }, []);

  useEffect(() => {
    if (!state.isActive) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            return { ...prev, isActive: false };
          }
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }
        return {
          ...prev,
          seconds: prev.seconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isActive]);

  return {
    ...state,
    toggle,
    reset,
    setMinutes,
  };
};
