// src/api/notificationApi.ts
import axiosClient from './axiosClient';

export interface NotificationResponse {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  module?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResponse {
  data: NotificationResponse[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

export interface CreateNotificationRequest {
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  module?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  userId?: string;
  isGlobal?: boolean;
}

export interface NotificationFilters {
  type?: 'info' | 'success' | 'warning' | 'error' | 'system';
  module?: string;
  isRead?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

class NotificationApi {
  private baseUrl = '/notifications';

  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationsListResponse> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.module) params.append('module', filters.module);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await axiosClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getNotification(id: string): Promise<NotificationResponse> {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await axiosClient.get(`${this.baseUrl}/unread-count`);
    return response.data;
  }

  async createNotification(data: CreateNotificationRequest): Promise<NotificationResponse> {
    const response = await axiosClient.post(this.baseUrl, data);
    return response.data;
  }

  async markAsRead(id: string): Promise<NotificationResponse> {
    const response = await axiosClient.patch(`${this.baseUrl}/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<void> {
    await axiosClient.patch(`${this.baseUrl}/mark-all-read`);
  }

  async updateNotification(id: string, data: { isRead?: boolean }): Promise<NotificationResponse> {
    const response = await axiosClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteNotification(id: string): Promise<void> {
    await axiosClient.delete(`${this.baseUrl}/${id}`);
  }

  async deleteAllNotifications(): Promise<void> {
    await axiosClient.delete(this.baseUrl);
  }
}

export const notificationApi = new NotificationApi();