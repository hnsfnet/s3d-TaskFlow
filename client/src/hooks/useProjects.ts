import { useEffect, useCallback, useMemo } from 'react';
import { useProjectStore } from '../stores';
import { useMemberStore } from '../stores';

export function useProjects() {
  const { projects, loading, error, fetchAll, fetchById, addMember, removeMember } = useProjectStore();
  const currentUser = useMemberStore(state => state.getCurrentUser());

  const loadProjects = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  const loadProject = useCallback(
    (id: string) => {
      fetchById(id);
    },
    [fetchById]
  );

  const addProjectMember = useCallback(
    (projectId: string, memberId: string) => {
      addMember(projectId, memberId, currentUser.id);
    },
    [addMember, currentUser.id]
  );

  const removeProjectMember = useCallback(
    (projectId: string, memberId: string) => {
      removeMember(projectId, memberId, currentUser.id);
    },
    [removeMember, currentUser.id]
  );

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects]);

  return {
    projects: sortedProjects,
    loading,
    error,
    loadProjects,
    loadProject,
    addProjectMember,
    removeProjectMember,
  };
}

export default useProjects;
