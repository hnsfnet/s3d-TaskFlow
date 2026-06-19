import { useEffect, useState, useRef } from 'react';
import { taskApi } from '../services/api';
import type { Task, TaskStatus, Member } from '../types';
import { useUser } from '../context/UserContext';

interface KanbanBoardProps {
  projectId: string;
  projectMembers: Member[];
}

const COLUMNS: { key: TaskStatus; title: string }[] = [
  { key: 'todo', title: '待办' },
  { key: 'in_progress', title: '进行中' },
  { key: 'done', title: '已完成' },
];

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

function KanbanBoard({ projectId, projectMembers }: KanbanBoardProps) {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const dragTaskRef = useRef<Task | null>(null);

  useEffect(() => {
    taskApi.getByProject(projectId).then(setTasks);
  }, [projectId]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    dragTaskRef.current = task;
    setDraggingTaskId(task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    dragTaskRef.current = null;
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (!taskId) return;

    const dragTask = dragTaskRef.current || tasks.find(t => t.id === taskId);
    if (!dragTask || dragTask.status === targetStatus) {
      handleDragEnd();
      return;
    }

    if (updatingTaskId === taskId) {
      handleDragEnd();
      return;
    }

    setUpdatingTaskId(taskId);

    try {
      const updated = await taskApi.update(taskId, {
        status: targetStatus,
        actorId: currentUser.id,
      });
      setTasks(prev => {
        const exists = prev.some(t => t.id === taskId);
        if (!exists) {
          return [...prev, updated];
        }
        return prev.map(t => (t.id === taskId ? updated : t));
      });
    } catch (err) {
      console.error('更新任务失败', err);
    } finally {
      setUpdatingTaskId(null);
      handleDragEnd();
    }
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const getMemberById = (id: string | null) => projectMembers.find(m => m.id === id);

  return (
    <div className="kanban-board">
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.key);
        return (
          <div
            key={column.key}
            className={`kanban-column ${dragOverColumn === column.key ? 'drag-over' : ''}`}
            onDragOver={e => handleDragOver(e, column.key)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={e => handleDrop(e, column.key)}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">{column.title}</span>
              <span className="kanban-column-count">{columnTasks.length}</span>
            </div>
            <div>
              {columnTasks.map(task => {
                const assignee = getMemberById(task.assigneeId);
                const isDragging = draggingTaskId === task.id;
                const isUpdating = updatingTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`task-card ${isDragging ? 'dragging' : ''} ${isUpdating ? 'task-card-updating' : ''}`}
                    draggable={!isUpdating}
                    onDragStart={e => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="task-card-title">{task.title}</div>
                    <div className="task-card-footer">
                      <span className={`priority-tag priority-${task.priority}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {assignee ? (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="avatar"
                          style={{ width: 28, height: 28 }}
                          title={assignee.name}
                        />
                      ) : (
                        <div className="avatar" style={{ width: 28, height: 28 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
