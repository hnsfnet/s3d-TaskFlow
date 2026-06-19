import axios from 'axios';
import type { Project, Task, Member } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects').then(r => r.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then(r => r.data),
};

export const taskApi = {
  getByProject: (projectId: string) => api.get<Task[]>('/tasks', { params: { projectId } }).then(r => r.data),
  update: (id: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data).then(r => r.data),
};

export const memberApi = {
  getAll: () => api.get<Member[]>('/members').then(r => r.data),
  create: (data: { name: string; role: Member['role'] }) => api.post<Member>('/members', data).then(r => r.data),
  remove: (id: string) => api.delete(`/members/${id}`).then(r => r.data),
};
