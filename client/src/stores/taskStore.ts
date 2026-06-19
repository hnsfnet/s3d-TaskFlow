import { create } from 'zustand';
import type { Task, TaskStatus } from '../types';
import { taskApi } from '../api';

interface TaskState {
  tasks: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
  updatingTaskId: string | null;

  fetchByProject: (projectId: string) => Promise<void>;
  updateTask: (id: string, projectId: string, data: { status?: TaskStatus; actorId?: string; assigneeId?: string | null }) => Promise<void>;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (projectId: string, status: TaskStatus) => Task[];
  clearProjectTasks: (projectId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: {},
  loading: false,
  error: null,
  updatingTaskId: null,

  fetchByProject: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await taskApi.getByProject(projectId);
      set(state => ({
        tasks: { ...state.tasks, [projectId]: data },
      }));
    } catch (err: any) {
      set({ error: err.message || '加载任务失败' });
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, projectId, data) => {
    const { updatingTaskId } = get();
    if (updatingTaskId === id) return;

    set({ updatingTaskId: id });
    try {
      const updated = await taskApi.update(id, data);
      set(state => {
        const projectTasks = state.tasks[projectId] || [];
        const exists = projectTasks.some(t => t.id === id);
        const newTasks = exists
          ? projectTasks.map(t => (t.id === id ? updated : t))
          : [...projectTasks, updated];
        return {
          tasks: { ...state.tasks, [projectId]: newTasks },
        };
      });
    } catch (err: any) {
      console.error('更新任务失败', err);
    } finally {
      set({ updatingTaskId: null });
    }
  },

  getTasksByProject: projectId => {
    return get().tasks[projectId] || [];
  },

  getTasksByStatus: (projectId, status) => {
    return get().tasks[projectId]?.filter(t => t.status === status) || [];
  },

  clearProjectTasks: projectId => {
    set(state => {
      const next = { ...state.tasks };
      delete next[projectId];
      return { tasks: next };
    });
  },
}));

export default useTaskStore;
