// src/contexts/WebSocketNotificationContext.tsx
import React, { createContext, useContext } from 'react';

interface WebSocketNotificationContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketNotificationContext = createContext<WebSocketNotificationContextType>({
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useWebSocketNotifications = () => {
  return useContext(WebSocketNotificationContext);
};

export const WebSocketNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <WebSocketNotificationContext.Provider value={{
      isConnected: false,
      connect: () => console.log('WebSocket connect called'),
      disconnect: () => console.log('WebSocket disconnect called'),
    }}>
      {children}
    </WebSocketNotificationContext.Provider>
  );
};