export type MemberRole = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: string;
  progress: number;
  tasks?: Task[];
}
