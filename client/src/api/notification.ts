import { http } from '../http';
import type { Notification } from '../../types';
import type {
  GetNotificationsParams,
  GetUnreadCountParams,
  UnreadCountResponse,
  MarkAllAsReadRequest,
  MarkAllAsReadResponse,
} from '../types/notification';

export const notificationApi = {
  getByUser: (userId: string) =>
    http.get<Notification[]>('/notifications', { params: { userId } as GetNotificationsParams }).then(r => r.data),

  getUnreadCount: (userId: string) =>
    http.get<UnreadCountResponse>('/notifications/unread-count', { params: { userId } as GetUnreadCountParams }).then(r => r.data),

  markAsRead: (id: string) =>
    http.patch<Notification>(`/notifications/${id}/read`).then(r => r.data),

  markAllAsRead: (userId: string) =>
    http.patch<MarkAllAsReadResponse>('/notifications/read-all', { userId } as MarkAllAsReadRequest).then(r => r.data),
};

export default notificationApi;
