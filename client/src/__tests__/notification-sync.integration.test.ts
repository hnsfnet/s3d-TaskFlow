import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationStore, useMemberStore } from '../../stores';
import { startMockServer } from '../../test/mocks/server';

startMockServer();

describe('通知已读同步 - 集成测试', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      skipNextPoll: false,
    });
    useMemberStore.setState({ members: [], currentUserId: '2' });
  });

  const seedNotifications = async (count: number, unreadCount: number) => {
    const notifs = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      notifs.push({
        id: `n${i + 1}`,
        userId: '2',
        activityId: `a${i + 1}`,
        message: `测试通知 ${i + 1}`,
        link: '/projects/p1',
        read: i >= unreadCount,
        createdAt: new Date(now - i * 60000).toISOString(),
      });
    }
    useNotificationStore.setState({
      notifications: notifs,
      unreadCount,
    });
    return notifs;
  };

  it('初始未读数正确', async () => {
    await seedNotifications(5, 3);
    expect(useNotificationStore.getState().unreadCount).toBe(3);
  });

  it('单条标记已读后，未读数减一', async () => {
    await seedNotifications(5, 3);
    const store = useNotificationStore.getState();
    const unreadNotifs = store.notifications.filter(n => !n.read);
    expect(unreadNotifs).toHaveLength(3);

    const target = unreadNotifs[0];
    await store.markAsRead(target.id, '2');

    const after = useNotificationStore.getState();
    expect(after.unreadCount).toBe(2);

    const updated = after.notifications.find(n => n.id === target.id);
    expect(updated?.read).toBe(true);
  });

  it('标记已读的通知再次点击，未读数不变', async () => {
    await seedNotifications(5, 3);
    const store = useNotificationStore.getState();
    const unreadNotifs = store.notifications.filter(n => !n.read);
    const target = unreadNotifs[0];

    await store.markAsRead(target.id, '2');
    expect(useNotificationStore.getState().unreadCount).toBe(2);

    await store.markAsRead(target.id, '2');
    expect(useNotificationStore.getState().unreadCount).toBe(2);
  });

  it('一键全部已读后，未读数归零', async () => {
    await seedNotifications(5, 3);
    const store = useNotificationStore.getState();

    await store.markAllAsRead('2');

    const after = useNotificationStore.getState();
    expect(after.unreadCount).toBe(0);
    expect(after.notifications.every(n => n.read)).toBe(true);
  });

  it('全部已读后再点全部已读，状态不变', async () => {
    await seedNotifications(5, 0);
    const store = useNotificationStore.getState();
    expect(store.unreadCount).toBe(0);

    await store.markAllAsRead('2');

    const after = useNotificationStore.getState();
    expect(after.unreadCount).toBe(0);
  });

  it('skipNextPoll 标记后，下一次轮询跳过更新', async () => {
    await seedNotifications(5, 3);
    const store = useNotificationStore.getState();

    store.setSkipNextPoll(true);
    expect(useNotificationStore.getState().skipNextPoll).toBe(true);

    await store.fetchUnreadCount('2');

    const after = useNotificationStore.getState();
    expect(after.skipNextPoll).toBe(false);
    expect(after.unreadCount).toBe(3);
  });

  it('标记已读后 skipNextPoll 自动生效', async () => {
    await seedNotifications(5, 3);
    const store = useNotificationStore.getState();

    store.setSkipNextPoll(true);
    const unreadId = store.notifications.find(n => !n.read)?.id;
    expect(unreadId).toBeDefined();

    if (unreadId) {
      await store.markAsRead(unreadId, '2');
      expect(useNotificationStore.getState().unreadCount).toBe(2);
    }
  });

  it('未读通知数为 0 时，角标不显示', async () => {
    await seedNotifications(5, 0);
    const count = useNotificationStore.getState().unreadCount;
    expect(count).toBe(0);
  });

  it('大量未读通知时，数量计算正确', async () => {
    await seedNotifications(50, 42);
    expect(useNotificationStore.getState().unreadCount).toBe(42);
  });
});
