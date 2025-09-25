import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button  from '../components/UI/Button'; 
import Card from '../components/UI/Card';
import { ArrowLeft, Bell, Search, CheckCheck, Trash2, Check, Eye, Calendar, Settings, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import   { useNotificationsContext } from '../contexts/NotificationContext';
import { NotificationType } from '../types/notification';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateFilters,
    // isConnected,
  } = useNotificationsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const observerRef = useRef<HTMLDivElement>(null);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: NotificationType, isRead: boolean) => {
    const opacity = isRead ? '5' : '10';
    switch (type) {
      case 'success':
        return `bg-green-50 dark:bg-green-900/${opacity}`;
      case 'error':
        return `bg-red-50 dark:bg-red-900/${opacity}`;
      case 'warning':
        return `bg-yellow-50 dark:bg-yellow-900/${opacity}`;
      case 'info':
        return `bg-blue-50 dark:bg-blue-900/${opacity}`;
      case 'system':
        return `bg-purple-50 dark:bg-purple-900/${opacity}`;
      default:
        return `bg-gray-50 dark:bg-gray-900/${opacity}`;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'unread') return matchesSearch && !notification.isRead;
    return matchesSearch && notification.type === filter;
  });

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  };

  // Scrolling infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          updateFilters({ offset: notifications.length });
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, updateFilters, notifications.length]);

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-500">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="p-3 bg-blue-500 rounded-lg mr-4">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Notifications
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes les notifications sont lues'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <Bell className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {notifications.length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">Total notifications</p>
          </Card>
          <Card className="text-center">
            <div className="p-3 bg-red-500/10 rounded-lg inline-block mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {unreadCount}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">Non lues</p>
          </Card>
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {notifications.filter((n) => n.type === 'success').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">Succès</p>
          </Card>
          <Card className="text-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg inline-block mb-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {notifications.filter((n) => n.type === 'warning').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">Alertes</p>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une notification..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      updateFilters({ search: e.target.value });
                    }}
                    className="w-full pl-10Rae pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => {
                    const newFilter = e.target.value as 'all' | 'unread' | NotificationType;
                    setFilter(newFilter);
                    updateFilters({
                      isRead: newFilter === 'unread' ? false : undefined,
                      type: newFilter !== 'all' && newFilter !== 'unread' ? newFilter : undefined,
                    });
                  }}
                  className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                >
                  <option value="all">Toutes</option>
                  <option value="unread">Non lues</option>
                  <option value="info">Info</option>
                  <option value="success">Succès</option>
                  <option value="warning">Alertes</option>
                  <option value="error">Erreurs</option>
                  <option value="system">Système</option>
                </select>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Tout marquer comme lu
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout effacer
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Notifications ({filteredNotifications.length})
            </h2>

            {filteredNotifications.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-nexsaas-vanta-black dark:text-gray-300">Aucune notification trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className={`p-4 rounded-lg transition-all hover:shadow-md ${getNotificationBg(
                      notification.type,
                      notification.isRead
                    )} ${!notification.isRead ? 'border-l-4 border-nexsaas-saas-green' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min Ascendant min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`text-lg font-semibold ${
                                notification.isRead
                                  ? 'text-nexsaas-vanta-black dark:text-gray-300'
                                  : 'text-nexsaas-deep-blue dark:text-nexsaas-pure-white'
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {notification.module && (
                              <span className="text-xs px-2 py-1 bg-nexsaas-deep-blue/10 text-nexsaas-deep-blue dark:bg-nexsaas-saas-green/10 dark:text-nexsaas-saas-green rounded-full">
                                {notification.module}
                              </span>
                            )}
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-nexsaas-saas-green rounded-full"></span>
                            )}
                          </div>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatTime(notification.createdAt)}
                            </div>
                            <span>•</span>
                            <span>{getRelativeTime(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.actionUrl && (
                          <Link to={notification.actionUrl}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        {!notification.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-200 animate-pulse h-24"></div>
                  ))}
                <div ref={observerRef} />
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage;