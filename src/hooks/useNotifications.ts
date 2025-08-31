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
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    initialFilters = {},
    autoRefresh = true,
    refreshInterval = 30000, // 30 secondes
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
  const showToast = useToast().showToast;

  // const { addToast } = useToast(); // La propriété 'addToast' n'existe pas sur le type 'ToastContextType'

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
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast({ 
        type: 'success', 
        title: 'Succès', 
        message: 'Notification marquée comme lue' 
      });
    } catch (err) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: 'Erreur lors de la mise à jour de la notification' 
      });
      console.error('Error marking notification as read:', err);
    }
  }, [showToast]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      showToast({ 
        type: 'success', 
        title: 'Succès', 
        message: 'Toutes les notifications marquées comme lues' 
      });
    } catch (err) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: 'Erreur lors de la mise à jour des notifications' 
      });
      console.error('Error marking all notifications as read:', err);
    }
  }, [showToast]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Mettre à jour le compteur si la notification supprimée n'était pas lue
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setTotal(prev => prev - 1);
      showToast({ 
        type: 'success', 
        title: 'Succès', 
        message: 'Notification supprimée' 
      });
    } catch (err) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: 'Erreur lors de la suppression de la notification' 
      });
      console.error('Error deleting notification:', err);
    }
  }, [notifications, showToast]);

  const deleteAll = useCallback(async () => {
    try {
      await notificationApi.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      setCurrentOffset(0);
      showToast({ 
        type: 'success', 
        title: 'Succès', 
        message: 'Toutes les notifications ont été supprimées' 
      });
    } catch (err) {
      showToast({ 
        type: 'error', 
        title: 'Erreur', 
        message: 'Erreur lors de la suppression des notifications' 
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
  }, [filters, fetchNotifications]); // React Hook useEffect has a missing dependency: 'fetchNotifications'. Either include it or remove the dependency array.eslintreact-hooks/exhaustive-deps

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

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
    deleteAll: deleteAll,
    updateFilters,
  };
};