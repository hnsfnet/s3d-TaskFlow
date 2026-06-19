import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';
import { memberApi, notificationApi } from '../services/api';
import { useUser } from '../context/UserContext';
import { formatRelativeTime } from '../utils/format';

const NotificationBell: React.FC = () => {
  const { currentUser, setAllMembers } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loadingMarkAll, setLoadingMarkAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    memberApi.getAll().then(setAllMembers).catch(() => {});
  }, [setAllMembers]);

  const loadAll = () => {
    Promise.all([
      notificationApi.getByUser(currentUser.id),
      notificationApi.getUnreadCount(currentUser.id),
    ]).then(([list, c]) => {
      setNotifications(list);
      setUnreadCount(c.count);
    });
  };

  useEffect(() => {
    loadAll();
    const itv = setInterval(() => {
      notificationApi.getUnreadCount(currentUser.id).then(c => setUnreadCount(c.count));
    }, 8000);
    return () => clearInterval(itv);
  }, [currentUser.id]);

  useEffect(() => {
    if (open) loadAll();
  }, [open, currentUser.id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await notificationApi.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    setLoadingMarkAll(true);
    try {
      await notificationApi.markAllAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } finally {
      setLoadingMarkAll(false);
    }
  };

  const handleClickItem = (n: Notification) => {
    if (!n.read) {
      notificationApi.markAsRead(n.id).then(() => {
        setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, read: true } : x)));
        setUnreadCount(c => Math.max(0, c - 1));
      });
    }
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <CurrentUserSwitcher />
      <button className="notification-bell" onClick={() => setOpen(v => !v)} aria-label="通知">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>通知（{unreadCount} 条未读）</span>
            {unreadCount > 0 && (
              <button className="notification-read-all" onClick={handleMarkAllRead} disabled={loadingMarkAll}>
                {loadingMarkAll ? '处理中...' : '全部已读'}
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">暂无通知</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.read ? 'notification-item-unread' : ''}`}
                  onClick={() => handleClickItem(n)}
                >
                  <span className="notification-dot" />
                  <div className="notification-content">
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  {!n.read && (
                    <button className="notification-mark-btn" onClick={e => handleMarkRead(n.id, e)} title="标记已读">
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CurrentUserSwitcher: React.FC = () => {
  const { currentUser, allMembers, setCurrentUserId } = useUser();
  if (allMembers.length <= 1) return null;
  return (
    <div className="user-switcher-wrap">
      <select
        className="user-switcher"
        value={currentUser.id}
        onChange={e => setCurrentUserId(e.target.value)}
      >
        {allMembers.map(m => (
          <option key={m.id} value={m.id}>
            以 {m.name} 身份
          </option>
        ))}
      </select>
    </div>
  );
};

export default NotificationBell;
