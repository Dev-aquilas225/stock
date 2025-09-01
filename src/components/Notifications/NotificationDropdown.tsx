import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { NotificationType } from '../../types/notification';
import Button from '../UI/Button';
import { useNotification } from '../../hooks/useNotifications';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAll: clearAllNotifications,
    refresh
  } = useNotification({ pageSize: 10 }); // Limiter à 10 pour le dropdown
  
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  // Rafraîchir automatiquement quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'system': return <Settings className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: NotificationType, isRead: boolean) => {
    const opacity = isRead ? '10' : '20';
    switch (type) {
      case 'success': return `bg-green-50 dark:bg-green-900/${opacity}`;
      case 'error': return `bg-red-50 dark:bg-red-900/${opacity}`;
      case 'warning': return `bg-yellow-50 dark:bg-yellow-900/${opacity}`;
      case 'info': return `bg-blue-50 dark:bg-blue-900/${opacity}`;
      case 'system': return `bg-purple-50 dark:bg-purple-900/${opacity}`;
      default: return `bg-gray-50 dark:bg-gray-900/${opacity}`;
    }
  };

  // Convertir les notifications API vers le format Notification
  const convertedNotifications = notifications.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    timestamp: new Date(n.createdAt),
    isRead: n.isRead,
    module: n.module,
    actionUrl: n.actionUrl,
    metadata: n.metadata,
  }));

  const filteredNotifications = filter === 'all' 
    ? convertedNotifications 
    : convertedNotifications.filter(n => n.type === filter);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full right-0 mt-2 w-96 bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl shadow-xl border border-nexsaas-light-gray dark:border-gray-700 z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-nexsaas-light-gray dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-1">
            {['all', 'info', 'success', 'warning', 'error', 'system'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as 'all' | NotificationType)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === filterType
                    ? 'bg-nexsaas-pure-white dark:bg-gray-600 text-nexsaas-deep-blue dark:text-nexsaas-pure-white'
                    : 'text-nexsaas-vanta-black dark:text-gray-300 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white'
                }`}
              >
                {filterType === 'all' ? 'Toutes' : filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="p-4 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-nexsaas-deep-blue" />
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                  {filter === 'all' ? 'Aucune notification' : `Aucune notification ${filter}`}
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-3 rounded-lg transition-all hover:shadow-sm ${
                      getNotificationBg(notification.type, notification.isRead)
                    } ${!notification.isRead ? 'border-l-4 border-nexsaas-saas-green' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            notification.isRead 
                              ? 'text-nexsaas-vanta-black dark:text-gray-300' 
                              : 'text-nexsaas-deep-blue dark:text-nexsaas-pure-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {notification.module && (
                              <span className="text-xs px-2 py-1 bg-nexsaas-deep-blue/10 text-nexsaas-deep-blue dark:bg-nexsaas-saas-green/10 dark:text-nexsaas-saas-green rounded-full">
                                {notification.module}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {notification.actionUrl && (
                              <Link to={notification.actionUrl} onClick={onClose}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </Link>
                            )}
                            
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="p-3 border-t border-nexsaas-light-gray dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link to="/notifications" onClick={onClose}>
                <Button variant="ghost" size="sm">
                  Voir toutes les notifications
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllNotifications}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Tout effacer
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;