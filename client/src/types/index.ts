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

export type ActivityType = 'task_created' | 'task_moved' | 'member_joined' | 'member_left';

export interface ActivityPayload {
  taskTitle?: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  memberName?: string;
}

export interface Activity {
  id: string;
  projectId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: ActivityType;
  payload: ActivityPayload;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  activityId: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}
