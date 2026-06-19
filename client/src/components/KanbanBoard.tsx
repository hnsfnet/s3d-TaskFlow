import { useEffect, useState } from 'react';
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

  useEffect(() => {
    taskApi.getByProject(projectId).then(setTasks);
  }, [projectId]);

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggingTaskId) return;
    const task = tasks.find(t => t.id === draggingTaskId);
    if (!task || task.status === targetStatus) return;
    try {
      const updated = await taskApi.update(draggingTaskId, {
        status: targetStatus,
        actorId: currentUser.id,
      });
      setTasks(prev => prev.map(t => (t.id === draggingTaskId ? updated : t)));
    } catch (err) {
      console.error('更新任务失败', err);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
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
                return (
                  <div
                    key={task.id}
                    className={`task-card ${draggingTaskId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
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
