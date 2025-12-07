import { useState, useEffect, useRef } from 'react';

interface UseMinimumLoadingDelayOptions {
  minimumDelay?: number; // Minimum czas w ms zanim loading state się pokaże
  minimumDuration?: number; // Minimum czas w ms przez który loading state jest widoczny
}

/**
 * Hook który zapobiega "miganiu" loading states dla szybkich operacji
 * 
 * @param isLoading - czy operacja jest w trakcie ładowania
 * @param options - konfiguracja delay
 * @returns boolean - czy pokazać loading state
 */
export const useMinimumLoadingDelay = (
  isLoading: boolean,
  options: UseMinimumLoadingDelayOptions = {}
): boolean => {
  const { minimumDelay = 300, minimumDuration = 500 } = options;

  const [showLoading, setShowLoading] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Rozpoczęcie ładowania
    if (isLoading && loadingStartTimeRef.current === null) {
      loadingStartTimeRef.current = Date.now();

      // Pokaż loading state dopiero po minimum delay
      delayTimerRef.current = setTimeout(() => {
        setShowLoading(true);
      }, minimumDelay);
    }

    // Zakończenie ładowania
    if (!isLoading && loadingStartTimeRef.current !== null) {
      const loadingDuration = Date.now() - loadingStartTimeRef.current;

      // Wyczyść timer opóźnienia jeśli jeszcze nie wystartował
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      if (showLoading) {
        // Jeśli loading state jest widoczny, upewnij się że będzie widoczny minimum czas
        const remainingTime = Math.max(0, minimumDuration - loadingDuration);

        durationTimerRef.current = setTimeout(() => {
          setShowLoading(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
      } else {
        // Jeśli loading state nie był jeszcze pokazany, po prostu wyczyść
        setShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current);
      }
    };
  }, [isLoading, minimumDelay, minimumDuration, showLoading]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setShowLoading(false);
      loadingStartTimeRef.current = null;
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current);
      }
    };
  }, []);

  return showLoading;
};