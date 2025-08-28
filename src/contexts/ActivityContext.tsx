import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

// Synchronisation avec les ActionType du backend
export type ActivityType = 
  | 'login' | 'logout' | 'reset_password' | 'change_password'
  | 'create' | 'update' | 'delete' | 'view' | 'scan'
  | 'sale' | 'payment' | 'refund' | 'invoice' | 'quote'
  | 'stock_in' | 'stock_out' | 'stock_adjustment' | 'inventory'
  | 'supply' | 'supplier_order' | 'order_receipt' | 'supplier_return'
  | 'commission' | 'commission_calculation' | 'commission_payment'
  | 'subscription' | 'subscription_activation' | 'subscription_renewal'
  | 'return' | 'return_request' | 'return_validation'
  | 'contact' | 'interaction' | 'phone_call' | 'email' | 'sms' | 'meeting'
  | 'rating' | 'review' | 'product_rating'
  | 'document_upload' | 'document_download' | 'document_validation'
  | 'report_generation' | 'data_export' | 'statistics_view'
  | 'pos_open' | 'pos_close' | 'pos_transaction' | 'cash_count'
  | 'system_backup' | 'system_maintenance' | 'system_error'
  | 'security_breach' | 'account_lock' | 'account_unlock';

export interface Activity {
  id: string;
  type: ActivityType;
  module: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  isSystemAction?: boolean;
}

export interface ActivityFilters {
  startDate?: Date;
  endDate?: Date;
  activityType?: ActivityType;
  module?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  topActivities: { type: ActivityType; count: number }[];
  moduleStats: { module: string; count: number }[];
}

interface ActivityContextType {
  // État local
  activities: Activity[];
  loading: boolean;
  error: string | null;
  stats: ActivityStats | null;
  
  // Actions locales
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  
  // Actions backend
  fetchActivities: (filters?: ActivityFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  exportActivities: (filters?: ActivityFilters) => Promise<void>;
  
  // Utilitaires
  getActivitiesByModule: (module: string) => Activity[];
  getActivitiesByType: (type: ActivityType) => Activity[];
  clearActivities: () => void;
  
  // Filtres
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    limit: 50
  });

  // Log une activité localement et l'envoie au backend
  // Log une activité localement
  const logActivity = useCallback(async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    };

    setActivities(prev => [newActivity, ...prev.slice(0, 999)]);
  }, []);

  // Récupérer les activités du backend
  const fetchActivities = useCallback(async (filterParams?: ActivityFilters) => {
  setLoading(true);
  setError(null);
  
  try {
    const params = new URLSearchParams();
    const currentFilters = { ...filters, ...filterParams };
    
    if (currentFilters.startDate) {
      params.append('startDate', currentFilters.startDate.toISOString());
    }
    if (currentFilters.endDate) {
      params.append('endDate', currentFilters.endDate.toISOString());
    }
    if (currentFilters.activityType) {
      params.append('actionType', currentFilters.activityType);
    }
    if (currentFilters.module) {
      params.append('module', currentFilters.module);
    }
    if (currentFilters.search) {
      params.append('search', currentFilters.search);
    }
    if (currentFilters.page) {
      params.append('page', currentFilters.page.toString());
    }
    if (currentFilters.limit) {
      params.append('limit', currentFilters.limit.toString());
    }

    const response = await axiosClient.get(`/audit/client?${params.toString()}`);
    
    // Les données sont maintenant déjà converties par le backend
    setActivities(response.data);
  } catch (err: any) {
    if (err.code !== 'ERR_CANCELED') {
      setError(err.response?.data?.message || 'Erreur lors du chargement des activités');
      console.error('Erreur fetchActivities:', err);
    }
  } finally {
    setLoading(false);
  }
  }, []);

  // Récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosClient.get('/audit/stats');
      setStats({
        totalActivities: response.data.totalActions || 0,
        todayActivities: response.data.todayActions || 0,
        topActivities: (response.data.topActions || []).map((item: any) => ({
          type: (item.type?.toLowerCase() || 'view') as ActivityType,
          count: item.count || 0,
        })),
        moduleStats: response.data.moduleStats || [],
      });
    } catch (err: any) {
      if (err.code !== 'ERR_CANCELED') {
        console.error('Erreur fetchStats:', err);
        // On continue même si les stats échouent
      }
    }
  }, []);

  // Exporter les activités
  const exportActivities = useCallback(async (filterParams?: ActivityFilters) => {
    try {
      const params = new URLSearchParams();
      const currentFilters = filterParams || filters;
      
      if (currentFilters.startDate) {
        params.append('startDate', currentFilters.startDate.toISOString());
      }
      if (currentFilters.endDate) {
        params.append('endDate', currentFilters.endDate.toISOString());
      }
      if (currentFilters.activityType) {
        params.append('actionType', currentFilters.activityType.toUpperCase());
      }
      if (currentFilters.module) {
        params.append('module', currentFilters.module);
      }
      if (currentFilters.search) {
        params.append('search', currentFilters.search);
      }

      const response = await axiosClient.get(`/audit/export?${params.toString()}`);
      
      // Créer et télécharger le fichier CSV
      const csvContent = response.data.data.map((row: any) => 
        Object.values(row).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activites-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Erreur exportActivities:', err);
      alert('Erreur lors de l\'exportation: ' + (err.response?.data?.message || err.message));
    }
  }, [filters]);

  // Utilitaires
  const getActivitiesByModule = useCallback((module: string) => {
    return activities.filter(activity => 
      activity.module && activity.module.toLowerCase() === module.toLowerCase()
    );
  }, [activities]);

  const getActivitiesByType = useCallback((type: ActivityType) => {
    return activities.filter(activity => activity.type === type);
  }, [activities]);

  const clearActivities = useCallback(() => {
    setActivities([]);
    setStats(null);
    setError(null);
  }, []);

  // Charger les activités au montage
  useEffect(() => {

    let isMounted = true;

    const initializeActivities = async () => {
      try {
        if (isMounted) setLoading(true);
        await fetchStats();
        await fetchActivities();
      } catch (error) {
        console.warn('Erreur lors du chargement initial des activités:', error);
      }finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeActivities();

    return () => {
      isMounted = false;
    };

  }, []); // Seulement au montage initial

  return (
    <ActivityContext.Provider value={{
      // État
      activities,
      loading,
      error,
      stats,
      filters,
      
      // Actions
      logActivity,
      fetchActivities,
      fetchStats,
      exportActivities,
      setFilters,
      
      // Utilitaires
      getActivitiesByModule,
      getActivitiesByType,
      clearActivities,
    }}>
      {children}
    </ActivityContext.Provider>
  );
};