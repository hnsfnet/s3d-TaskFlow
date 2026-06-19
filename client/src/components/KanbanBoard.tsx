import { useEffect, useState } from 'react';
import { useTasks } from '../hooks';
import type { TaskStatus, Member } from '../types';

interface KanbanBoardProps {
  projectId: string;
  projectMembers: Member[];
}

const COLUMNS: { key: TaskStatus; title: string }[] = [
  { key: 'todo', title: '待办' },
  { key: 'in_progress', title: '进行中' },
  { key: 'done', title: '已完成' },
];

const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
} as const;

function KanbanBoard({ projectId, projectMembers }: KanbanBoardProps) {
  const {
    tasksByStatus,
    updatingTaskId,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  } = useTasks(projectId);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      handleDragEnd();
    };
  }, [handleDragEnd]);

  const onDragStart = (e: React.DragEvent, taskId: string, status: TaskStatus) => {
    setDraggingTaskId(taskId);
    handleDragStart(e, taskId, status);
  };

  const onDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
    handleDragEnd();
  };

  const onDragOver = (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const onDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    handleDrop(e, targetStatus);
    onDragEnd();
  };

  const getMemberById = (id: string | null) => projectMembers.find(m => m.id === id);

  return (
    <div className="kanban-board">
      {COLUMNS.map(column => {
        const columnTasks = tasksByStatus(column.key);
        return (
          <div
            key={column.key}
            className={`kanban-column ${dragOverColumn === column.key ? 'drag-over' : ''}`}
            onDragOver={e => onDragOver(e, column.key)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={e => onDrop(e, column.key)}
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
                    onDragStart={e => onDragStart(e, task.id, task.status)}
                    onDragEnd={onDragEnd}
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
