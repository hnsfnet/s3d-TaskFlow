import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let members = [
  { id: '1', name: '张三', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
  { id: '2', name: '李四', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
  { id: '3', name: '王五', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' },
  { id: '4', name: '赵六', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu' },
  { id: '5', name: '钱七', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi' },
];

let tasks = [
  { id: 't1', title: '设计系统架构', projectId: 'p1', assigneeId: '1', status: 'done', priority: 'high' },
  { id: 't2', title: '搭建开发环境', projectId: 'p1', assigneeId: '2', status: 'done', priority: 'high' },
  { id: 't3', title: '编写接口文档', projectId: 'p1', assigneeId: '3', status: 'in_progress', priority: 'medium' },
  { id: 't4', title: '前端页面开发', projectId: 'p1', assigneeId: '4', status: 'todo', priority: 'medium' },
  { id: 't5', title: 'UI 设计稿', projectId: 'p2', assigneeId: '1', status: 'done', priority: 'high' },
  { id: 't6', title: '数据库建模', projectId: 'p2', assigneeId: '2', status: 'in_progress', priority: 'high' },
  { id: 't7', title: '用户认证模块', projectId: 'p2', assigneeId: '3', status: 'todo', priority: 'low' },
  { id: 't8', title: '需求分析', projectId: 'p3', assigneeId: '5', status: 'in_progress', priority: 'high' },
  { id: 't9', title: '竞品调研', projectId: 'p3', assigneeId: '4', status: 'todo', priority: 'medium' },
  { id: 't10', title: '原型设计', projectId: 'p3', assigneeId: '2', status: 'todo', priority: 'low' },
];

let projects = [
  { id: 'p1', name: '电商平台重构', description: '对现有电商平台进行技术栈升级和架构重构', memberIds: ['1', '2', '3', '4'], createdAt: '2024-01-15' },
  { id: 'p2', name: '移动端 APP 开发', description: '开发团队协作的移动应用，支持 iOS 和 Android', memberIds: ['1', '2', '3'], createdAt: '2024-02-01' },
  { id: 'p3', name: '数据分析平台', description: '构建内部数据分析可视化平台', memberIds: ['2', '4', '5'], createdAt: '2024-03-10' },
];

let activities = [];
let notifications = [];

const STATUS_LABELS = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const nowIso = () => new Date().toISOString();

const getMemberName = (id) => {
  const m = members.find(x => x.id === id);
  return m ? m.name : '未知';
};

const getMemberAvatar = (id) => {
  const m = members.find(x => x.id === id);
  return m ? m.avatar : '';
};

const getProjectById = (id) => projects.find(p => p.id === id);

const calculateProgress = (projectId) => {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  if (projectTasks.length === 0) return 0;
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  return Math.round((doneTasks.length / projectTasks.length) * 100);
};

const createActivity = ({ projectId, actorId, type, payload }) => {
  const activity = {
    id: 'a' + generateId(),
    projectId,
    actorId,
    actorName: getMemberName(actorId),
    actorAvatar: getMemberAvatar(actorId),
    type,
    payload: payload || {},
    createdAt: nowIso(),
  };
  activities.unshift(activity);
  return activity;
};

const createNotification = ({ userId, activity, message, link }) => {
  const notification = {
    id: 'n' + generateId(),
    userId,
    activityId: activity.id,
    message,
    link: link || null,
    read: false,
    createdAt: activity.createdAt,
  };
  notifications.unshift(notification);
  return notification;
};

const notifyProjectMembers = (projectId, activity, message, excludeUserId = null) => {
  const project = getProjectById(projectId);
  if (!project) return;
  project.memberIds.forEach(mid => {
    if (mid !== excludeUserId) {
      createNotification({
        userId: mid,
        activity,
        message,
        link: `/projects/${projectId}`,
      });
    }
  });
};

const initSeedActivities = () => {
  const seed = [
    { pId: 'p1', aId: '1', type: 'task_created', payload: { taskTitle: '设计系统架构' }, offsetMs: 86400000 * 5 },
    { pId: 'p1', aId: '2', type: 'task_created', payload: { taskTitle: '搭建开发环境' }, offsetMs: 86400000 * 4 },
    { pId: 'p1', aId: '1', type: 'task_moved', payload: { taskTitle: '设计系统架构', fromStatus: 'todo', toStatus: 'done' }, offsetMs: 86400000 * 3 },
    { pId: 'p1', aId: '2', type: 'task_moved', payload: { taskTitle: '搭建开发环境', fromStatus: 'todo', toStatus: 'done' }, offsetMs: 86400000 * 2 },
    { pId: 'p1', aId: '3', type: 'task_moved', payload: { taskTitle: '编写接口文档', fromStatus: 'todo', toStatus: 'in_progress' }, offsetMs: 3600000 * 6 },
    { pId: 'p2', aId: '5', type: 'member_joined', payload: { memberName: '钱七' }, offsetMs: 86400000 * 7 },
    { pId: 'p2', aId: '1', type: 'task_moved', payload: { taskTitle: 'UI 设计稿', fromStatus: 'in_progress', toStatus: 'done' }, offsetMs: 3600000 * 20 },
    { pId: 'p2', aId: '2', type: 'task_moved', payload: { taskTitle: '数据库建模', fromStatus: 'todo', toStatus: 'in_progress' }, offsetMs: 3600000 * 3 },
    { pId: 'p3', aId: '5', type: 'task_moved', payload: { taskTitle: '需求分析', fromStatus: 'todo', toStatus: 'in_progress' }, offsetMs: 3600000 * 8 },
  ];
  const base = Date.now();
  seed.forEach(s => {
    const createdAt = new Date(base - s.offsetMs).toISOString();
    const activity = {
      id: 'a' + generateId(),
      projectId: s.pId,
      actorId: s.aId,
      actorName: getMemberName(s.aId),
      actorAvatar: getMemberAvatar(s.aId),
      type: s.type,
      payload: s.payload,
      createdAt,
    };
    activities.push(activity);
  });
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const seedNotifs = [
    { uid: '2', msg: '张三 将 "设计系统架构" 移至 已完成', link: '/projects/p1' },
    { uid: '3', msg: '张三 将 "设计系统架构" 移至 已完成', link: '/projects/p1' },
    { uid: '4', msg: '张三 将 "设计系统架构" 移至 已完成', link: '/projects/p1' },
    { uid: '1', msg: '李四 将 "搭建开发环境" 移至 已完成', link: '/projects/p1' },
    { uid: '5', msg: '你 加入了项目 数据分析平台', link: '/projects/p3', read: false },
    { uid: '2', msg: '钱七 加入了项目 移动端 APP 开发', link: '/projects/p2' },
  ];
  seedNotifs.forEach((n, i) => {
    notifications.push({
      id: 'n' + generateId(),
      userId: n.uid,
      activityId: activities[Math.min(i, activities.length - 1)].id,
      message: n.msg,
      link: n.link,
      read: i > 3,
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    });
  });
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

initSeedActivities();

app.get('/api/projects', (req, res) => {
  const projectsWithProgress = projects.map(p => ({
    ...p,
    progress: calculateProgress(p.id),
  }));
  res.json(projectsWithProgress);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: '项目不存在' });
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  res.json({ ...project, progress: calculateProgress(project.id), tasks: projectTasks });
});

app.post('/api/projects', (req, res) => {
  const { name, description, memberIds, actorId } = req.body;
  const newProject = {
    id: 'p' + generateId(),
    name,
    description,
    memberIds: memberIds || [],
    createdAt: new Date().toISOString().split('T')[0],
  };
  projects.push(newProject);
  res.status(201).json({ ...newProject, progress: 0 });
});

app.get('/api/tasks', (req, res) => {
  const { projectId } = req.query;
  let filtered = tasks;
  if (projectId) filtered = tasks.filter(t => t.projectId === projectId);
  res.json(filtered);
});

app.patch('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) return res.status(404).json({ message: '任务不存在' });
  const oldTask = tasks[taskIndex];
  const newTask = { ...oldTask, ...req.body };
  tasks[taskIndex] = newTask;

  const { actorId } = req.body;
  if (actorId && oldTask.status !== newTask.status) {
    const activity = createActivity({
      projectId: newTask.projectId,
      actorId,
      type: 'task_moved',
      payload: {
        taskTitle: newTask.title,
        fromStatus: oldTask.status,
        toStatus: newTask.status,
      },
    });
    const actorName = actorId === newTask.assigneeId ? '你' : activity.actorName;
    const msg = `${actorName} 将 "${newTask.title}" 移至 ${STATUS_LABELS[newTask.status]}`;
    notifyProjectMembers(newTask.projectId, activity, msg);
    if (newTask.assigneeId && newTask.assigneeId !== actorId) {
      const existing = notifications.find(n => n.userId === newTask.assigneeId && n.activityId === activity.id);
      if (!existing) {
        createNotification({
          userId: newTask.assigneeId,
          activity,
          message: msg,
          link: `/projects/${newTask.projectId}`,
        });
      }
    }
  }

  res.json(newTask);
});

app.post('/api/tasks', (req, res) => {
  const { title, projectId, assigneeId, priority, actorId } = req.body;
  const newTask = {
    id: 't' + generateId(),
    title,
    projectId,
    assigneeId,
    status: 'todo',
    priority: priority || 'medium',
  };
  tasks.push(newTask);

  if (actorId) {
    const activity = createActivity({
      projectId,
      actorId,
      type: 'task_created',
      payload: { taskTitle: title },
    });
    const actorName = activity.actorName;
    const msg = `${actorName} 创建了任务 "${title}"`;
    notifyProjectMembers(projectId, activity, msg);
  }

  res.status(201).json(newTask);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) return res.status(404).json({ message: '任务不存在' });
  tasks.splice(taskIndex, 1);
  res.json({ message: '删除成功' });
});

app.get('/api/members', (req, res) => {
  res.json(members);
});

app.post('/api/members', (req, res) => {
  const { name, role } = req.body;
  const newMember = {
    id: generateId(),
    name,
    role: role || 'member',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}${Date.now()}`,
  };
  members.push(newMember);
  res.status(201).json(newMember);
});

app.delete('/api/members/:id', (req, res) => {
  const memberIndex = members.findIndex(m => m.id === req.params.id);
  if (memberIndex === -1) return res.status(404).json({ message: '成员不存在' });
  const deletedMember = members[memberIndex];
  const { actorId } = req.query;
  const affectedProjects = projects.filter(p => p.memberIds.includes(deletedMember.id));

  members.splice(memberIndex, 1);
  projects = projects.map(p => ({
    ...p,
    memberIds: p.memberIds.filter(id => id !== deletedMember.id),
  }));
  tasks = tasks.map(t => {
    if (t.assigneeId === deletedMember.id) {
      return { ...t, assigneeId: null };
    }
    return t;
  });

  const actor = actorId || null;
  affectedProjects.forEach(project => {
    const activity = createActivity({
      projectId: project.id,
      actorId: actor || deletedMember.id,
      type: 'member_left',
      payload: { memberName: deletedMember.name },
    });
    const msg = `${deletedMember.name} 退出了项目 ${project.name}`;
    notifyProjectMembers(project.id, activity, msg, deletedMember.id);
  });

  res.json({ message: '删除成功' });
});

app.post('/api/projects/:projectId/members', (req, res) => {
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) return res.status(404).json({ message: '项目不存在' });
  const { memberId, actorId } = req.body;
  if (project.memberIds.includes(memberId)) {
    return res.status(400).json({ message: '成员已在项目中' });
  }
  project.memberIds.push(memberId);
  const member = members.find(m => m.id === memberId);

  if (actorId && member) {
    const activity = createActivity({
      projectId: project.id,
      actorId,
      type: 'member_joined',
      payload: { memberName: member.name },
    });
    const msg = `${member.name} 加入了项目 ${project.name}`;
    notifyProjectMembers(project.id, activity, msg, memberId);
    createNotification({
      userId: memberId,
      activity,
      message: `你 加入了项目 ${project.name}`,
      link: `/projects/${project.id}`,
    });
  }

  res.json({ ...project, progress: calculateProgress(project.id) });
});

app.delete('/api/projects/:projectId/members/:memberId', (req, res) => {
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) return res.status(404).json({ message: '项目不存在' });
  const { memberId } = req.params;
  const { actorId } = req.query;
  project.memberIds = project.memberIds.filter(id => id !== memberId);
  const member = members.find(m => m.id === memberId);

  if (actorId && member) {
    const activity = createActivity({
      projectId: project.id,
      actorId,
      type: 'member_left',
      payload: { memberName: member.name },
    });
    const msg = `${member.name} 退出了项目 ${project.name}`;
    notifyProjectMembers(project.id, activity, msg, memberId);
  }

  res.json({ ...project, progress: calculateProgress(project.id) });
});

app.get('/api/projects/:projectId/activities', (req, res) => {
  const { projectId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const projectActivities = activities
    .filter(a => a.projectId === projectId)
    .slice(0, limit);
  res.json(projectActivities);
});

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId 是必填项' });
  const userNotifs = notifications.filter(n => n.userId === userId);
  res.json(userNotifs);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: '通知不存在' });
  notifications[idx] = { ...notifications[idx], read: true };
  res.json(notifications[idx]);
});

app.patch('/api/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId 是必填项' });
  let count = 0;
  notifications = notifications.map(n => {
    if (n.userId === userId && !n.read) {
      count++;
      return { ...n, read: true };
    }
    return n;
  });
  res.json({ updated: count });
});

app.get('/api/notifications/unread-count', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId 是必填项' });
  const count = notifications.filter(n => n.userId === userId && !n.read).length;
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`TaskFlow Server is running on http://localhost:${PORT}`);
});
