import { create } from 'zustand';
import type { Project, Activity } from '../types';
import { projectApi } from '../api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  activities: Activity[];
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  fetchActivities: (projectId: string) => Promise<void>;
  addMember: (projectId: string, memberId: string, actorId: string) => Promise<void>;
  removeMember: (projectId: string, memberId: string, actorId: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  activities: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await projectApi.getAll();
      set({ projects: data });
    } catch (err: any) {
      set({ error: err.message || '加载项目失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await projectApi.getById(id);
      set({ currentProject: data });
      set(state => ({
        projects: state.projects.map(p => (p.id === id ? data : p)),
      }));
    } catch (err: any) {
      set({ error: err.message || '加载项目详情失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchActivities: async (projectId: string) => {
    try {
      const data = await projectApi.getActivities(projectId);
      set({ activities: data });
    } catch (err: any) {
      console.error('加载活动失败', err);
    }
  },

  addMember: async (projectId: string, memberId: string, actorId: string) => {
    try {
      const updated = await projectApi.addMember(projectId, { memberId, actorId });
      set(state => ({
        projects: state.projects.map(p => (p.id === projectId ? updated : p)),
        currentProject: state.currentProject?.id === projectId ? updated : state.currentProject,
      }));
    } catch (err: any) {
      console.error('添加成员失败', err);
    }
  },

  removeMember: async (projectId: string, memberId: string, actorId: string) => {
    try {
      const updated = await projectApi.removeMember(projectId, memberId, { actorId });
      set(state => ({
        projects: state.projects.map(p => (p.id === projectId ? updated : p)),
        currentProject: state.currentProject?.id === projectId ? updated : state.currentProject,
      }));
    } catch (err: any) {
      console.error('移除成员失败', err);
    }
  },

  clearCurrent: () => {
    set({ currentProject: null, activities: [] });
  },
}));

export default useProjectStore;
