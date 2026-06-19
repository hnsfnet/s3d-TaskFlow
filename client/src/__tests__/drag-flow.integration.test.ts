import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore, useProjectStore, useNotificationStore, useMemberStore } from '../../stores';
import { startMockServer } from '../../test/mocks/server';

startMockServer();

describe('拖拽流程 - 集成测试', () => {
  beforeEach(async () => {
    useTaskStore.setState({ tasks: {} });
    useProjectStore.setState({ activities: [] });
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
    useMemberStore.setState({ members: [], currentUserId: '1' });

    await useMemberStore.getState().fetchAll();
    await useTaskStore.getState().fetchByProject('p1');
  });

  it('初始状态：待办 1 个，进行中 1 个，已完成 1 个', () => {
    const tasks = useTaskStore.getState().getTasksByProject('p1');
    expect(tasks).toHaveLength(3);
    expect(useTaskStore.getState().getTasksByStatus('p1', 'todo')).toHaveLength(1);
    expect(useTaskStore.getState().getTasksByStatus('p1', 'in_progress')).toHaveLength(1);
    expect(useTaskStore.getState().getTasksByStatus('p1', 'done')).toHaveLength(1);
  });

  it('将任务从待办移到进行中，任务状态更新', async () => {
    const todoTasks = useTaskStore.getState().getTasksByStatus('p1', 'todo');
    expect(todoTasks).toHaveLength(1);
    const task = todoTasks[0];
    expect(task.status).toBe('todo');

    await useTaskStore.getState().updateTask(task.id, 'p1', {
      status: 'in_progress',
      actorId: '1',
    });

    const updatedTask = useTaskStore
      .getState()
      .getTasksByProject('p1')
      .find(t => t.id === task.id);
    expect(updatedTask?.status).toBe('in_progress');

    expect(useTaskStore.getState().getTasksByStatus('p1', 'todo')).toHaveLength(0);
    expect(useTaskStore.getState().getTasksByStatus('p1', 'in_progress')).toHaveLength(2);
  });

  it('移动任务后，活动时间线多了一条对应记录', async () => {
    const initialActivities = useProjectStore.getState().activities;
    expect(initialActivities).toHaveLength(0);

    const task = useTaskStore.getState().getTasksByStatus('p1', 'todo')[0];
    await useTaskStore.getState().updateTask(task.id, 'p1', {
      status: 'in_progress',
      actorId: '1',
    });

    await useProjectStore.getState().fetchActivities('p1');

    const activities = useProjectStore.getState().activities;
    expect(activities.length).toBeGreaterThan(0);

    const latest = activities[0];
    expect(latest.type).toBe('task_moved');
    expect(latest.payload.taskTitle).toBe(task.title);
    expect(latest.payload.fromStatus).toBe('todo');
    expect(latest.payload.toStatus).toBe('in_progress');
  });

  it('任务负责人不是操作人时，负责人会收到通知', async () => {
    const task = useTaskStore.getState().getTasksByStatus('p1', 'todo')[0];
    expect(task.assigneeId).toBe('1');

    const inProgressTasks = useTaskStore.getState().getTasksByStatus('p1', 'in_progress');
    const task2 = inProgressTasks.find(t => t.assigneeId === '2');
    expect(task2).toBeDefined();

    if (task2) {
      const initialNotifs = useNotificationStore.getState().notifications;
      expect(initialNotifs).toHaveLength(0);

      await useTaskStore.getState().updateTask(task2.id, 'p1', {
        status: 'todo',
        actorId: '1',
      });

      await useNotificationStore.getState().fetchAll('2');

      const notifs = useNotificationStore.getState().notifications;
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs.some(n => n.message.includes(task2.title))).toBe(true);
      expect(notifs.some(n => n.userId === '2')).toBe(true);
    }
  });

  it('操作人自己就是负责人时，不生成通知', async () => {
    const task = useTaskStore.getState().getTasksByStatus('p1', 'todo')[0];
    expect(task.assigneeId).toBe('1');

    await useTaskStore.getState().updateTask(task.id, 'p1', {
      status: 'in_progress',
      actorId: '1',
    });

    await useNotificationStore.getState().fetchAll('1');
    const notifs = useNotificationStore.getState().notifications;
    const relevantNotifs = notifs.filter(n => n.message.includes(task.title));
    expect(relevantNotifs).toHaveLength(0);
  });

  it('多次连续移动任务，活动记录数量正确', async () => {
    const task = useTaskStore.getState().getTasksByStatus('p1', 'todo')[0];

    await useTaskStore.getState().updateTask(task.id, 'p1', {
      status: 'in_progress',
      actorId: '1',
    });
    await useTaskStore.getState().updateTask(task.id, 'p1', {
      status: 'done',
      actorId: '1',
    });

    await useProjectStore.getState().fetchActivities('p1');
    const activities = useProjectStore.getState().activities;

    const taskActivities = activities.filter(a => a.payload.taskTitle === task.title);
    expect(taskActivities.length).toBeGreaterThanOrEqual(2);
  });
});
