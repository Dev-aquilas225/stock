// src/components/Audit/ActivityWidget.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Eye, 
  ChevronRight, 
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useActivity } from '../../contexts/ActivityContext';
import { useAudit } from '../../hooks/useAudit';

interface ActivityWidgetProps {
  className?: string;
  showTitle?: boolean;
  maxItems?: number;
}

/**
 * Widget pour afficher les dernières activités sur le dashboard
 */
export const ActivityWidget: React.FC<ActivityWidgetProps> = ({ 
  className = '', 
  showTitle = true,
  maxItems = 5 
}) => {
  const { activities, loading: activityLoading } = useActivity();
  const { stats, loading: auditLoading, fetchStats } = useAudit(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const recentActivities = activities.slice(0, maxItems);
  const loading = activityLoading || auditLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getActivityIcon = (type: string) => {
    // Mapping simplifié pour le widget
    const iconMap: Record<string, JSX.Element> = {
      login: <Clock className="w-3 h-3 text-green-500" />,
      logout: <Clock className="w-3 h-3 text-red-500" />,
      sale: <TrendingUp className="w-3 h-3 text-green-500" />,
      create: <TrendingUp className="w-3 h-3 text-blue-500" />,
      update: <RefreshCw className="w-3 h-3 text-yellow-500" />,
      delete: <AlertCircle className="w-3 h-3 text-red-500" />,
      view: <Eye className="w-3 h-3 text-gray-500" />,
    };
    
    return iconMap[type] || <Activity className="w-3 h-3 text-gray-500" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Activité récente
              </h3>
              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                {stats?.todayActivities || 0} actions aujourd'hui
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Link to="/activity">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Voir tout
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                Aucune activité récente
              </p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-nexsaas-vanta-black dark:text-gray-400">
                    <span className="capitalize">{activity.module}</span>
                    {activity.userName && (
                      <>
                        <span>•</span>
                        <span>{activity.userName}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className="text-xs text-nexsaas-vanta-black dark:text-gray-400">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Stats summary */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-nexsaas-light-gray dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                {stats.totalActivities}
              </p>
              <p className="text-xs text-nexsaas-vanta-black dark:text-gray-400">
                Total
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {stats.todayActivities}
              </p>
              <p className="text-xs text-nexsaas-vanta-black dark:text-gray-400">
                Aujourd'hui
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">
                {stats.topActivities[0]?.count || 0}
              </p>
              <p className="text-xs text-nexsaas-vanta-black dark:text-gray-400">
                Top action
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ActivityWidget;
