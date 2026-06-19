import type { TaskPriority, TaskStatus } from '../../types';

export interface GetTasksParams {
  projectId: string;
}

export interface UpdateTaskRequest {
  status?: TaskStatus;
  assigneeId?: string | null;
  priority?: TaskPriority;
  title?: string;
  actorId?: string;
}

export interface CreateTaskRequest {
  title: string;
  projectId: string;
  assigneeId?: string | null;
  priority?: TaskPriority;
  actorId: string;
}
