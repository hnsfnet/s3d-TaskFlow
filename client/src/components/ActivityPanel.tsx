import React, { useEffect, useState, useRef } from 'react';
import type { Activity } from '../types';
import { projectApi } from '../services/api';
import { formatRelativeTime, buildActivityText } from '../utils/format';

interface ActivityPanelProps {
  projectId: string;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ projectId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [newIdSet, setNewIdSet] = useState<Set<string>>(new Set());

  const loadActivities = () => {
    projectApi.getActivities(projectId).then(data => {
      setActivities(prev => {
        const prevIds = new Set(prev.map(a => a.id));
        const newcomers = data.filter(a => !prevIds.has(a.id) && seenIdsRef.current.size > 0 && !seenIdsRef.current.has(a.id));
        if (newcomers.length > 0) {
          const newIds = new Set(newcomers.map(a => a.id));
          setNewIdSet(newIds);
          setTimeout(() => setNewIdSet(new Set()), 1200);
        }
        data.forEach(a => seenIdsRef.current.add(a.id));
        return data;
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    setActivities([]);
    seenIdsRef.current = new Set();
    setLoading(true);
    loadActivities();
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading && activities.length === 0) return <div className="activity-panel loading">加载中...</div>;

  return (
    <aside className="activity-panel">
      <h3 className="activity-panel-title">活动时间线</h3>
      {activities.length === 0 ? (
        <div className="activity-empty">暂无活动</div>
      ) : (
        <ul className="activity-list">
          {activities.map(activity => {
            const isNew = newIdSet.has(activity.id);
            return (
              <li
                key={activity.id}
                className={`activity-item ${isNew ? 'activity-item-new' : ''}`}
              >
                <img
                  src={activity.actorAvatar}
                  alt={activity.actorName}
                  className="activity-avatar"
                />
                <div className="activity-body">
                  <p className="activity-text">
                    {buildActivityText(activity)}
                  </p>
                  <span className="activity-time">· {formatRelativeTime(activity.createdAt)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};

export default ActivityPanel;
