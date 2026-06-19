import React, { useEffect, useState, useRef } from 'react';
import { useActivities } from '../hooks';
import { formatRelativeTime, buildActivityText } from '../utils/format';

interface ActivityPanelProps {
  projectId: string;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ projectId }) => {
  const { activities, loadActivities } = useActivities(projectId);
  const [loading, setLoading] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [newIdSet, setNewIdSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    seenIdsRef.current = new Set();
    setLoading(true);
    loadActivities();
  }, [projectId, loadActivities]);

  useEffect(() => {
    if (activities.length > 0 && loading) {
      setLoading(false);
    }
    const currentIds = new Set(activities.map(a => a.id));
    const newcomers = activities.filter(
      a => !seenIdsRef.current.has(a.id) && seenIdsRef.current.size > 0
    );
    if (newcomers.length > 0) {
      const newIds = new Set(newcomers.map(a => a.id));
      setNewIdSet(newIds);
      setTimeout(() => setNewIdSet(new Set()), 1200);
    }
    activities.forEach(a => seenIdsRef.current.add(a.id));
  }, [activities, loading]);

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
