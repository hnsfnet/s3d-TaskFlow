import { useEffect, useCallback, useRef } from 'react';
import { useNotificationStore } from '../stores';
import { useMemberStore } from '../stores';

const POLL_INTERVAL = 8000;

export function useNotifications() {
  const { notifications, unreadCount, loading, error, fetchAll, fetchUnreadCount, markAsRead, markAllAsRead, setSkipNextPoll } =
    useNotificationStore();
  const currentUser = useMemberStore(state => state.getCurrentUser());
  const pollTimerRef = useRef<number | null>(null);

  const loadNotifications = useCallback(() => {
    fetchAll(currentUser.id);
  }, [fetchAll, currentUser.id]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = window.setInterval(() => {
      fetchUnreadCount(currentUser.id);
    }, POLL_INTERVAL);
  }, [fetchUnreadCount, currentUser.id]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleMarkRead = useCallback(
    async (id: string) => {
      setSkipNextPoll(true);
      await markAsRead(id, currentUser.id);
    },
    [markAsRead, setSkipNextPoll, currentUser.id]
  );

  const handleMarkAllRead = useCallback(async () => {
    setSkipNextPoll(true);
    await markAllAsRead(currentUser.id);
  }, [markAllAsRead, setSkipNextPoll, currentUser.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    startPolling,
    stopPolling,
    markAsRead: handleMarkRead,
    markAllAsRead: handleMarkAllRead,
    setSkipNextPoll,
  };
}

export default useNotifications;
