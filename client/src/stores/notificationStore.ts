import { create } from 'zustand';
import type { Notification } from '../types';
import { notificationApi } from '../api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  skipNextPoll: boolean;

  fetchAll: (userId: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
  markAsRead: (id: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  setSkipNextPoll: (skip: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  skipNextPoll: false,

  fetchAll: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const [list, countData] = await Promise.all([
        notificationApi.getByUser(userId),
        notificationApi.getUnreadCount(userId),
      ]);
      set({ notifications: list, unreadCount: countData.count });
    } catch (err: any) {
      set({ error: err.message || '加载通知失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async (userId: string) => {
    if (get().skipNextPoll) {
      set({ skipNextPoll: false });
      return;
    }
    try {
      const data = await notificationApi.getUnreadCount(userId);
      set({ unreadCount: data.count });
    } catch (err: any) {
      console.error('获取未读数失败', err);
    }
  },

  markAsRead: async (id: string, _userId: string) => {
    try {
      const updated = await notificationApi.markAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n => (n.id === id ? updated : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err: any) {
      console.error('标记已读失败', err);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await notificationApi.markAllAsRead(userId);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err: any) {
      console.error('全部已读失败', err);
    }
  },

  setSkipNextPoll: skip => {
    set({ skipNextPoll: skip });
  },
}));

export default useNotificationStore;
