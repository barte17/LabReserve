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

  // Debounced handler to prevent duplicate events
  const handleAvailabilityChanged = useCallback((data: AvailabilityChangedData) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce similar events within 500ms
    debounceTimerRef.current = setTimeout(() => {
      const lastData = lastDataRef.current;
      
      // Skip if this is a duplicate event
      if (lastData && 
          lastData.SalaId === data.SalaId && 
          lastData.StanowiskoId === data.StanowiskoId &&
          lastData.ChangedDate === data.ChangedDate &&
          lastData.NewStatus === data.NewStatus &&
          Math.abs(data.Timestamp - lastData.Timestamp) < 1000) {
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
    }, 200); // 200ms debounce
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

    // Cleanup function
    return () => {
      console.log('[RealtimeCalendar] Cleaning up real-time calendar');
      
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Remove event listener
      connection.off('AvailabilityChanged', handleAvailabilityChanged);
      
      // Leave groups
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
    };
  }, [connection, isConnected, salaId, stanowiskoId, handleAvailabilityChanged]);

  return {
    isConnected,
    connection
  };
};