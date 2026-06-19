import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMembers } from '../hooks';
import type { Notification } from '../types';
import { formatRelativeTime } from '../utils/format';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loadNotifications, startPolling, stopPolling, markAsRead, markAllAsRead, setSkipNextPoll } =
    useNotifications();
  const { members, loadMembers, currentUser, switchUser } = useMembers();

  const [open, setOpen] = useState(false);
  const [loadingMarkAll, setLoadingMarkAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    loadNotifications();
    startPolling();
    return () => stopPolling();
  }, [currentUser?.id, loadNotifications, startPolling, stopPolling]);

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
    setSkipNextPoll(true);
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setLoadingMarkAll(true);
    setSkipNextPoll(true);
    try {
      await markAllAsRead();
    } finally {
      setLoadingMarkAll(false);
    }
  };

  const handleClickItem = async (n: Notification) => {
    if (!n.read) {
      setSkipNextPoll(true);
      await markAsRead(n.id);
    }
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <CurrentUserSwitcher members={members} currentUserId={currentUser?.id} onSwitch={switchUser} />
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

interface SwitcherProps {
  members: { id: string; name: string }[];
  currentUserId?: string;
  onSwitch: (id: string) => void;
}

const CurrentUserSwitcher: React.FC<SwitcherProps> = ({ members, currentUserId, onSwitch }) => {
  if (members.length <= 1) return null;
  return (
    <div className="user-switcher-wrap">
      <select
        className="user-switcher"
        value={currentUserId || ''}
        onChange={e => onSwitch(e.target.value)}
      >
        {members.map(m => (
          <option key={m.id} value={m.id}>
            以 {m.name} 身份
          </option>
        ))}
      </select>
    </div>
  );
};

export default NotificationBell;
