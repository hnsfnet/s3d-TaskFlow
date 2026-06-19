import { create } from 'zustand';
import type { Member } from '../types';
import { memberApi } from '../api';

interface MemberState {
  members: Member[];
  currentUserId: string;
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  createMember: (data: { name: string; role: Member['role'] }) => Promise<void>;
  removeMember: (id: string, actorId?: string) => Promise<void>;
  setCurrentUserId: (id: string) => void;
  getCurrentUser: () => Member;
}

const defaultMember: Member = {
  id: '1',
  name: '张三',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
};

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  currentUserId: '1',
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await memberApi.getAll();
      set({ members: data });
    } catch (err: any) {
      set({ error: err.message || '加载成员失败' });
    } finally {
      set({ loading: false });
    }
  },

  createMember: async data => {
    try {
      const newMember = await memberApi.create(data);
      set(state => ({ members: [...state.members, newMember] }));
    } catch (err: any) {
      console.error('创建成员失败', err);
    }
  },

  removeMember: async (id, actorId) => {
    try {
      await memberApi.remove(id, actorId ? { actorId } : undefined);
      set(state => ({
        members: state.members.filter(m => m.id !== id),
      }));
    } catch (err: any) {
      console.error('删除成员失败', err);
    }
  },

  setCurrentUserId: id => {
    set({ currentUserId: id });
  },

  getCurrentUser: () => {
    const { members, currentUserId } = get();
    return members.find(m => m.id === currentUserId) || members[0] || defaultMember;
  },
}));

export default useMemberStore;
