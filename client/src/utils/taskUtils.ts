import type { Task, TaskPriority, TaskStatus } from '../types';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function filterTasksByAssignee(tasks: Task[], assigneeId: string | null): Task[] {
  if (assigneeId === null || assigneeId === undefined) return tasks;
  return tasks.filter(t => t.assigneeId === assigneeId);
}

export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status);
}

export function filterAndSortTasks(
  tasks: Task[],
  options: {
    assigneeId?: string | null;
    status?: TaskStatus;
    sortBy?: 'priority' | 'default';
  } = {}
): Task[] {
  let result = tasks;
  if (options.status !== undefined) {
    result = filterTasksByStatus(result, options.status);
  }
  if (options.assigneeId !== undefined) {
    result = filterTasksByAssignee(result, options.assigneeId);
  }
  if (options.sortBy === 'priority') {
    result = sortTasksByPriority(result);
  }
  return result;
}
