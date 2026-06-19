import { useCallback, useMemo } from 'react';
import { useMemberStore } from '../stores';

export function useMembers() {
  const { members, currentUserId, loading, error, fetchAll, createMember, removeMember, setCurrentUserId, getCurrentUser } =
    useMemberStore();

  const currentUser = useMemo(() => getCurrentUser(), [getCurrentUser, members, currentUserId]);

  const loadMembers = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  const addMember = useCallback((name: string, role: 'admin' | 'member') => {
    createMember({ name, role });
  }, [createMember]);

  const deleteMember = useCallback(
    (id: string) => {
      removeMember(id, currentUser.id);
    },
    [removeMember, currentUser.id]
  );

  const switchUser = useCallback(
    (id: string) => {
      setCurrentUserId(id);
    },
    [setCurrentUserId]
  );

  const getMemberById = useCallback(
    (id: string | null) => {
      if (!id) return undefined;
      return members.find(m => m.id === id);
    },
    [members]
  );

  return {
    members,
    currentUser,
    currentUserId,
    loading,
    error,
    loadMembers,
    addMember,
    deleteMember,
    switchUser,
    getMemberById,
  };
}

export default useMembers;
