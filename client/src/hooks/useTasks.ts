import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useTaskStore } from '../stores';
import { useMemberStore } from '../stores';
import type { TaskStatus } from '../types';

export function useTasks(projectId: string | undefined) {
  const {
    loading,
    error,
    updatingTaskId,
    fetchByProject,
    updateTask,
    getTasksByProject,
    getTasksByStatus,
  } = useTaskStore();
  const currentUser = useMemberStore(state => state.getCurrentUser());

  const dragTaskRef = useRef<{ id: string; status: TaskStatus } | null>(null);

  const allTasks = useMemo(() => {
    if (!projectId) return [];
    return getTasksByProject(projectId);
  }, [projectId, getTasksByProject, loading]);

  const loadTasks = useCallback(() => {
    if (!projectId) return;
    fetchByProject(projectId);
  }, [projectId, fetchByProject]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string, status: TaskStatus) => {
    dragTaskRef.current = { id: taskId, status };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragTaskRef.current = null;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault();
      if (!projectId) return;

      const taskId = e.dataTransfer.getData('text/plain') || dragTaskRef.current?.id;
      if (!taskId) return;

      const task = allTasks.find(t => t.id === taskId);
      if (!task || task.status === targetStatus) return;

      updateTask(taskId, projectId, {
        status: targetStatus,
        actorId: currentUser.id,
      });
    },
    [projectId, allTasks, updateTask, currentUser.id]
  );

  const tasksByStatus = useCallback(
    (status: TaskStatus) => {
      if (!projectId) return [];
      return getTasksByStatus(projectId, status);
    },
    [projectId, getTasksByStatus]
  );

  return {
    tasks: allTasks,
    loading,
    error,
    updatingTaskId,
    loadTasks,
    tasksByStatus,
    updateTask: (id: string, data: { status?: TaskStatus; assigneeId?: string | null }) => {
      if (!projectId) return;
      updateTask(id, projectId, { ...data, actorId: currentUser.id });
    },
    handleDragStart,
    handleDragEnd,
    handleDrop,
    dragTaskRef,
  };
}

export default useTasks;
