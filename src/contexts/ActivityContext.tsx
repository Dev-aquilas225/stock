import React, { createContext, useContext, useState, useCallback } from 'react';

export type ActivityType = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'scan' | 'sale' | 'payment';

export interface Activity {
  id: string;
  type: ActivityType;
  module: string;
  description: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ActivityContextType {
  activities: Activity[];
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getActivitiesByModule: (module: string) => Activity[];
  getActivitiesByType: (type: ActivityType) => Activity[];
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

  const logActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setActivities(prev => [newActivity, ...prev.slice(0, 999)]); // Keep last 1000 activities
  }, []);

  const getActivitiesByModule = useCallback((module: string) => {
    return activities.filter(activity => activity.module === module);
  }, [activities]);

  const getActivitiesByType = useCallback((type: ActivityType) => {
    return activities.filter(activity => activity.type === type);
  }, [activities]);

  return (
    <ActivityContext.Provider value={{
      activities,
      logActivity,
      getActivitiesByModule,
      getActivitiesByType,
    }}>
      {children}
    </ActivityContext.Provider>
  );
};