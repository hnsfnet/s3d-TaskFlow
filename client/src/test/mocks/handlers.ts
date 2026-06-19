import { http, HttpResponse } from 'msw';
import type { Project, Task, Member, Activity, Notification } from '../../types';

let mockProjects: Project[] = [
  {
    id: 'p1',
    name: '测试项目 A',
    description: '一个用于测试的项目',
    memberIds: ['1', '2', '3'],
    createdAt: '2025-01-01T00:00:00.000Z',
    progress: 30,
  },
];

let mockTasks: Task[] = [
  { id: 't1', title: '任务一', projectId: 'p1', assigneeId: '1', status: 'todo', priority: 'high' },
  { id: 't2', title: '任务二', projectId: 'p1', assigneeId: '2', status: 'in_progress', priority: 'medium' },
  { id: 't3', title: '任务三', projectId: 'p1', assigneeId: '1', status: 'done', priority: 'low' },
];

const mockMembers: Member[] = [
  { id: '1', name: '张三', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
  { id: '2', name: '李四', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
  { id: '3', name: '王五', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' },
];

let mockActivities: Activity[] = [];
let mockNotifications: Notification[] = [];

export const resetMockData = () => {
  mockTasks = [
    { id: 't1', title: '任务一', projectId: 'p1', assigneeId: '1', status: 'todo', priority: 'high' },
    { id: 't2', title: '任务二', projectId: 'p1', assigneeId: '2', status: 'in_progress', priority: 'medium' },
    { id: 't3', title: '任务三', projectId: 'p1', assigneeId: '1', status: 'done', priority: 'low' },
  ];
  mockActivities = [];
  mockNotifications = [];
};

export const handlers = [
  http.get('/api/projects', () => {
    return HttpResponse.json(mockProjects);
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = mockProjects.find(p => p.id === params.id);
    if (!project) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(project);
  }),

  http.get('/api/projects/:id/activities', ({ params }) => {
    const projectActivities = mockActivities.filter(a => a.projectId === params.id);
    return HttpResponse.json(projectActivities);
  }),

  http.get('/api/tasks', ({ request }) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const tasks = projectId ? mockTasks.filter(t => t.projectId === projectId) : mockTasks;
    return HttpResponse.json(tasks);
  }),

  http.patch('/api/tasks/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    const task = mockTasks.find(t => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });

    const oldStatus = task.status;
    const newStatus = body.status ?? task.status;

    const updated: Task = { ...task, ...body };
    mockTasks = mockTasks.map(t => (t.id === params.id ? updated : t));

    if (body.status && body.status !== oldStatus) {
      const actor = mockMembers.find(m => m.id === body.actorId) || mockMembers[0];
      const newActivity: Activity = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: task.projectId,
        actorId: body.actorId || '1',
        actorName: actor.name,
        actorAvatar: actor.avatar,
        type: 'task_moved',
        payload: { taskTitle: task.title, fromStatus: oldStatus, toStatus: body.status },
        createdAt: new Date().toISOString(),
      };
      mockActivities.unshift(newActivity);

      if (task.assigneeId && task.assigneeId !== body.actorId) {
        const notif: Notification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: task.assigneeId,
          activityId: newActivity.id,
          message: `${actor.name} 将任务「${task.title}」移至新状态`,
          link: `/projects/${task.projectId}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        mockNotifications.unshift(notif);
      }
    }

    return HttpResponse.json(updated);
  }),

  http.get('/api/members', () => {
    return HttpResponse.json(mockMembers);
  }),

  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const notifs = userId ? mockNotifications.filter(n => n.userId === userId) : mockNotifications;
    return HttpResponse.json(notifs);
  }),

  http.get('/api/notifications/unread-count', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const count = mockNotifications.filter(n => n.userId === userId && !n.read).length;
    return HttpResponse.json({ count });
  }),

  http.patch('/api/notifications/:id/read', ({ params }) => {
    const notif = mockNotifications.find(n => n.id === params.id);
    if (!notif) return new HttpResponse(null, { status: 404 });
    notif.read = true;
    return HttpResponse.json(notif);
  }),

  http.patch('/api/notifications/read-all', async ({ request }) => {
    const body = await request.json() as { userId: string };
    let count = 0;
    mockNotifications.forEach(n => {
      if (n.userId === body.userId && !n.read) {
        n.read = true;
        count += 1;
      }
    });
    return HttpResponse.json({ updated: count });
  }),
];

export { mockProjects, mockTasks, mockMembers, mockActivities, mockNotifications };
