// src/contexts/NotificationContext.tsx
import React, { createContext, useContext } from 'react';
import { useNotification } from '../hooks/useNotifications';
import { NotificationType, Notification } from '../types/notification';
import { notificationApi } from '../api/notificationApi';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getUnreadNotifications: () => Notification[];
  refresh: () => Promise<void>;
  updateFilters: (filters: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    notifications: apiNotifications,
    unreadCount,
    loading,
    error,
    total,
    hasMore,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll: clearAllNotifications,
    updateFilters,
  } = useNotification({ 
    pageSize: 20, 
    // Suppression de autoRefresh et refreshInterval
    // Plus besoin de rafraîchissement automatique
  });

  // Convertir les notifications API en format Notification
  const notifications: Notification[] = apiNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    isGlobal: n.isGlobal,
    module: n.module,
    actionUrl: n.actionUrl,
    metadata: n.metadata,
    createdAt: new Date(n.createdAt),
    updatedAt: n.updatedAt,
  }));

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    await notificationApi.createNotification({
      ...notification,
      isGlobal: false,
    });
    // Rafraîchir après ajout pour voir la nouvelle notification
    await refresh();
  };

  const getNotificationsByType = (type: NotificationType) => {
    return notifications.filter((notification) => notification.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter((notification) => !notification.isRead);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        total,
        hasMore,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        getNotificationsByType,
        getUnreadNotifications,
        refresh,
        updateFilters,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};