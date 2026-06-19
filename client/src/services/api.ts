import axios from 'axios';
import type { Project, Task, Member, Activity, Notification } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects').then(r => r.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  addMember: (projectId: string, memberId: string, actorId: string) =>
    api.post<Project>(`/projects/${projectId}/members`, { memberId, actorId }).then(r => r.data),
  removeMember: (projectId: string, memberId: string, actorId: string) =>
    api.delete<Project>(`/projects/${projectId}/members/${memberId}`, { params: { actorId } }).then(r => r.data),
  getActivities: (projectId: string) =>
    api.get<Activity[]>(`/projects/${projectId}/activities`).then(r => r.data),
};

export const taskApi = {
  getByProject: (projectId: string) => api.get<Task[]>('/tasks', { params: { projectId } }).then(r => r.data),
  update: (id: string, data: Partial<Task> & { actorId?: string }) =>
    api.patch<Task>(`/tasks/${id}`, data).then(r => r.data),
  create: (data: { title: string; projectId: string; assigneeId?: string | null; priority?: Task['priority']; actorId: string }) =>
    api.post<Task>('/tasks', data).then(r => r.data),
};

export const memberApi = {
  getAll: () => api.get<Member[]>('/members').then(r => r.data),
  create: (data: { name: string; role: Member['role'] }) => api.post<Member>('/members', data).then(r => r.data),
  remove: (id: string, actorId?: string) =>
    api.delete(`/members/${id}`, { params: actorId ? { actorId } : undefined }).then(r => r.data),
};

export const notificationApi = {
  getByUser: (userId: string) =>
    api.get<Notification[]>('/notifications', { params: { userId } }).then(r => r.data),
  getUnreadCount: (userId: string) =>
    api.get<{ count: number }>('/notifications/unread-count', { params: { userId } }).then(r => r.data),
  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: (userId: string) =>
    api.patch<{ updated: number }>('/notifications/read-all', { userId }).then(r => r.data),
};
