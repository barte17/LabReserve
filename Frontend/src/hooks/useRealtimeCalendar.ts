import { useEffect, useCallback, useRef } from 'react';
import { useSignalR } from './useSignalR';

interface AvailabilityChangedData {
  SalaId?: number;
  StanowiskoId?: number;
  ChangedDate: string;
  NewStatus: string;
  Timestamp: number;
}

interface UseRealtimeCalendarProps {
  salaId?: number;
  stanowiskoId?: number;
  onAvailabilityChanged?: (data: AvailabilityChangedData) => void;
  onConnectionStateChanged?: (isConnected: boolean) => void;
}

export const useRealtimeCalendar = ({
  salaId,
  stanowiskoId,
  onAvailabilityChanged,
  onConnectionStateChanged
}: UseRealtimeCalendarProps) => {
  const { connection, isConnected } = useSignalR();
  const lastDataRef = useRef<AvailabilityChangedData | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceRef = useRef<number>(0); // For race condition handling
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null); // For connection resilience

  // Enhanced handler with race condition protection and better debouncing
  const handleAvailabilityChanged = useCallback((data: AvailabilityChangedData) => {
    // Increment sequence for race condition handling
    const currentSequence = ++sequenceRef.current;
    
    // Clear existing timer for better debouncing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Enhanced debouncing with sequence check
    debounceTimerRef.current = setTimeout(() => {
      // Race condition check - ignore if newer event came in
      if (currentSequence !== sequenceRef.current) {
        console.log('[RealtimeCalendar] Skipping outdated event (race condition)');
        return;
      }

      const lastData = lastDataRef.current;
      
      // Enhanced duplicate detection
      if (lastData && 
          lastData.SalaId === data.SalaId && 
          lastData.StanowiskoId === data.StanowiskoId &&
          lastData.ChangedDate === data.ChangedDate &&
          lastData.NewStatus === data.NewStatus &&
          Math.abs(data.Timestamp - lastData.Timestamp) < 2000) { // Increased to 2s
        console.log('[RealtimeCalendar] Skipping duplicate event');
        return;
      }

      // Check if this event is relevant to current resource
      const isRelevant = (data.SalaId === salaId) || (data.StanowiskoId === stanowiskoId);
      
      if (isRelevant) {
        console.log('[RealtimeCalendar] Processing availability change:', data);
        lastDataRef.current = data;
        onAvailabilityChanged?.(data);
      } else {
        console.log('[RealtimeCalendar] Event not relevant to current resource');
      }
    }, 500); // Increased to 500ms for better batching
  }, [salaId, stanowiskoId, onAvailabilityChanged]);

  // Connection state change handler
  useEffect(() => {
    onConnectionStateChanged?.(isConnected);
  }, [isConnected, onConnectionStateChanged]);

  // Setup SignalR connection and groups
  useEffect(() => {
    if (!connection || !isConnected) {
      console.log('[RealtimeCalendar] Connection not ready');
      return;
    }

    if (!salaId && !stanowiskoId) {
      console.log('[RealtimeCalendar] No resource specified');
      return;
    }

    console.log('[RealtimeCalendar] Setting up real-time calendar for:', { salaId, stanowiskoId });

    // Join calendar group
    const joinGroup = async () => {
      try {
        // Join groups for both sala and stanowisko
        if (salaId) {
          await connection.invoke('JoinCalendarGroup', salaId, null);
          console.log(`[RealtimeCalendar] Successfully joined sala group: Calendar_Sala_${salaId}`);
        }
        if (stanowiskoId) {
          await connection.invoke('JoinCalendarGroup', null, stanowiskoId);
          console.log(`[RealtimeCalendar] Successfully joined stanowisko group: Calendar_Stanowisko_${stanowiskoId}`);
        }
        if (!salaId && !stanowiskoId) {
          console.log('[RealtimeCalendar] No salaId or stanowiskoId provided');
        }
      } catch (error) {
        console.error('[RealtimeCalendar] Error joining calendar group:', error);
      }
    };

    // Setup event listener
    connection.on('AvailabilityChanged', handleAvailabilityChanged);
    
    // Join group
    joinGroup();

    // Setup connection resilience heartbeat
    const setupHeartbeat = () => {
      heartbeatRef.current = setInterval(() => {
        if (!isConnected && onAvailabilityChanged) {
          console.log('[RealtimeCalendar] Connection lost - triggering backup refresh');
          // Trigger a fake update to refresh data
          onAvailabilityChanged({
            SalaId: salaId,
            StanowiskoId: stanowiskoId,
            ChangedDate: new Date().toISOString().split('T')[0],
            NewStatus: 'backup-refresh',
            Timestamp: Date.now()
          });
        }
      }, 30000); // Check every 30 seconds
    };

    if (salaId || stanowiskoId) {
      setupHeartbeat();
    }

    // Enhanced cleanup function
    return () => {
      console.log('[RealtimeCalendar] Cleaning up real-time calendar');
      
      // Enhanced memory cleanup
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      
      // Reset refs to prevent memory leaks
      lastDataRef.current = null;
      sequenceRef.current = 0;

      // Remove event listener
      connection.off('AvailabilityChanged', handleAvailabilityChanged);
      
      // Leave groups only if connection is still active
      if (connection.state === 'Connected') {
        if (salaId) {
          connection.invoke('LeaveCalendarGroup', salaId, null).catch(error => {
            console.error('[RealtimeCalendar] Error leaving sala group:', error);
          });
        }
        if (stanowiskoId) {
          connection.invoke('LeaveCalendarGroup', null, stanowiskoId).catch(error => {
            console.error('[RealtimeCalendar] Error leaving stanowisko group:', error);
          });
        }
      } else {
        console.log('[RealtimeCalendar] Connection not active, skipping group leave operations');
      }
    };
  }, [connection, isConnected, salaId, stanowiskoId, handleAvailabilityChanged]);

  return {
    isConnected,
    connection
  };
};