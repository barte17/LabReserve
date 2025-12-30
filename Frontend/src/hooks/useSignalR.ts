import { useEffect, useState, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../contexts/AuthContext';

export const useSignalR = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isLogged } = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isLogged) {
      // Rozłącz jeśli nie zalogowany
      if (connectionRef.current) {
        connectionRef.current.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    // Utwórz nowe połączenie
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/notificationHub`, {
        accessTokenFactory: async () => {
          try {
            const { ensureValidToken } = await import('../services/authService');
            const token = await ensureValidToken();
            return token || ''; // Zawsze zwracaj string, nie null
          } catch (error) {
            console.error('Błąd pobierania tokena dla SignalR:', error);
            return '';
          }
        }
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    connectionRef.current = newConnection;
    setConnection(newConnection);

    // Połącz
    newConnection.start()
      .then(() => {
        console.log('SignalR połączony');
        setIsConnected(true);
      })
      .catch(err => {
        console.error('Błąd połączenia SignalR:', err);
        setIsConnected(false);
      });

    // Obsługa reconnect
    newConnection.onreconnected(() => {
      console.log('SignalR ponownie połączony');
      setIsConnected(true);
    });

    newConnection.onreconnecting(() => {
      console.log('SignalR próbuje się połączyć...');
      setIsConnected(false);
    });

    newConnection.onclose(() => {
      console.log('SignalR rozłączony');
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [isLogged]);

  return { connection, isConnected };
};