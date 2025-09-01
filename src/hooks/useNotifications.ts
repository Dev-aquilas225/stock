// src/hooks/useNotifications.ts - Version simplifiée
import { useState, useEffect, useCallback } from 'react';
import { notificationApi, NotificationResponse, NotificationFilters } from '../api/notificationApi';
import { useToast } from '../contexts/ToastContext';

export interface UseNotificationsReturn {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  updateFilters: (filters: NotificationFilters) => void;
}

interface UseNotificationsOptions {
  initialFilters?: NotificationFilters;
  pageSize?: number;
}

export const useNotification = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    initialFilters = {},
    pageSize = 20,
  } = options;

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>({
    ...initialFilters,
    limit: pageSize,
    offset: 0,
  });
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const newFilters = reset ? { ...filters, offset: 0 } : filters;
      const response = await notificationApi.getNotifications(newFilters);

      if (reset) {
        setNotifications(response.data);
        setCurrentOffset(response.data.length);
      } else {
        setNotifications(prev => [...prev, ...response.data]);
        setCurrentOffset(prev => prev + response.data.length);
      }

      setUnreadCount(response.unreadCount);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des notifications');
      console.error('Error fetching notifications:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les notifications',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const refresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (currentOffset < total && !loading) {
      setFilters(prev => ({
        ...prev,
        offset: currentOffset,
      }));
    }
  }, [currentOffset, total, loading]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      
      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      showToast({ 
        type: 'success', 
        title: 'Notification lue', 
        message: 'Notification marquée comme lue',
        duration: 2000,
      });
    } catch (err: any) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: err.message || 'Erreur lors de la mise à jour',
        duration: 4000,
      });
      console.error('Error marking notification as read:', err);
    }
  }, [showToast]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
      showToast({ 
        type: 'success', 
        title: 'Notifications lues', 
        message: 'Toutes les notifications ont été marquées comme lues',
        duration: 3000,
      });
    } catch (err: any) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: err.message || 'Erreur lors de la mise à jour',
        duration: 4000,
      });
      console.error('Error marking all notifications as read:', err);
    }
  }, [showToast]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      
      // Trouver la notification supprimée pour mettre à jour le compteur
      const deletedNotification = notifications.find(n => n.id === id);
      
      // Mettre à jour localement
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Mettre à jour les compteurs
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setTotal(prev => prev - 1);
      
      showToast({ 
        type: 'success', 
        title: 'Notification supprimée', 
        message: 'La notification a été supprimée',
        duration: 2000,
      });
    } catch (err: any) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: err.message || 'Erreur lors de la suppression',
        duration: 4000,
      });
      console.error('Error deleting notification:', err);
    }
  }, [notifications, showToast]);

  const deleteAll = useCallback(async () => {
    try {
      await notificationApi.deleteAllNotifications();
      
      // Vider localement
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      setCurrentOffset(0);
      
      showToast({ 
        type: 'success', 
        title: 'Notifications supprimées', 
        message: 'Toutes les notifications ont été supprimées',
        duration: 3000,
      });
    } catch (err: any) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: err.message || 'Erreur lors de la suppression',
        duration: 4000,
      });
      console.error('Error deleting all notifications:', err);
    }
  }, [showToast]);

  const updateFilters = useCallback((newFilters: NotificationFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0,
    }));
    setCurrentOffset(0);
  }, []);

  // Charger les notifications au montage et quand les filtres changent
  useEffect(() => {
    fetchNotifications(true);
  }, [filters]);

  const hasMore = currentOffset < total;

  return {
    notifications,
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
    deleteAll,
    updateFilters,
  };
};