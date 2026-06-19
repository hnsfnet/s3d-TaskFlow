import { useCallback, useEffect, useRef } from 'react';
import { useProjectStore } from '../stores';

const POLL_INTERVAL = 5000;

export function useActivities(projectId: string | undefined) {
  const { activities, fetchActivities } = useProjectStore();
  const pollTimerRef = useRef<number | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const loadActivities = useCallback(() => {
    if (!projectId) return;
    fetchActivities(projectId);
  }, [projectId, fetchActivities]);

  const startPolling = useCallback(() => {
    if (!projectId || pollTimerRef.current) return;
    loadActivities();
    pollTimerRef.current = window.setInterval(loadActivities, POLL_INTERVAL);
  }, [projectId, loadActivities]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  useEffect(() => {
    const currentIds = new Set(activities.map(a => a.id));
    const newIds = activities.filter(a => !prevIdsRef.current.has(a.id));
    prevIdsRef.current = currentIds;
  }, [activities]);

  const isNewActivity = useCallback(
    (id: string) => {
      const idx = activities.findIndex(a => a.id === id);
      return idx >= 0 && idx < 3 && activities.length > 0;
    },
    [activities]
  );

  return {
    activities,
    loadActivities,
    startPolling,
    stopPolling,
    isNewActivity,
  };
}

export default useActivities;
