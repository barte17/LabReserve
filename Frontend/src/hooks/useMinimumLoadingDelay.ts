import { useState, useEffect } from 'react';

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
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let durationTimer: NodeJS.Timeout;

    if (isLoading && !loadingStartTime) {
      // Rozpoczęcie ładowania
      const startTime = Date.now();
      setLoadingStartTime(startTime);

      // Pokaż loading state dopiero po minimum delay
      delayTimer = setTimeout(() => {
        if (isLoading) {
          setShowLoading(true);
        }
      }, minimumDelay);
    } else if (!isLoading && loadingStartTime) {
      // Zakończenie ładowania
      const loadingDuration = Date.now() - loadingStartTime;
      
      if (showLoading) {
        // Jeśli loading state jest widoczny, upewnij się że będzie widoczny minimum czas
        const remainingTime = Math.max(0, minimumDuration - loadingDuration);
        
        durationTimer = setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);
      } else {
        // Jeśli loading state nie był jeszcze pokazany, po prostu wyczyść
        setShowLoading(false);
        setLoadingStartTime(null);
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(durationTimer);
    };
  }, [isLoading, minimumDelay, minimumDuration, showLoading, loadingStartTime]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setShowLoading(false);
      setLoadingStartTime(null);
    };
  }, []);

  return showLoading;
};