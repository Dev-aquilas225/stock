// src/types/notification.ts
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  // timestamp: Date;
  isRead: boolean;
  module?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  fetchNotifications: (filters?: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getUnreadNotifications: () => Notification[];
  refresh: () => Promise<void>;
  isConnected: boolean;
}