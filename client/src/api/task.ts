import { http } from '../http';
import type { Task } from '../../types';
import type { GetTasksParams, UpdateTaskRequest, CreateTaskRequest } from '../types/task';

export const taskApi = {
  getByProject: (projectId: string) =>
    http.get<Task[]>('/tasks', { params: { projectId } as GetTasksParams }).then(r => r.data),

  update: (id: string, data: UpdateTaskRequest) =>
    http.patch<Task>(`/tasks/${id}`, data).then(r => r.data),

  create: (data: CreateTaskRequest) =>
    http.post<Task>('/tasks', data).then(r => r.data),

  remove: (id: string) =>
    http.delete(`/tasks/${id}`).then(r => r.data),
};

export default taskApi;
