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

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const calculateProgress = (projectId) => {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  if (projectTasks.length === 0) return 0;
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  return Math.round((doneTasks.length / projectTasks.length) * 100);
};

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
  const { name, description, memberIds } = req.body;
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
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

app.post('/api/tasks', (req, res) => {
  const { title, projectId, assigneeId, priority } = req.body;
  const newTask = {
    id: 't' + generateId(),
    title,
    projectId,
    assigneeId,
    status: 'todo',
    priority: priority || 'medium',
  };
  tasks.push(newTask);
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
  res.json({ message: '删除成功' });
});

app.listen(PORT, () => {
  console.log(`TaskFlow Server is running on http://localhost:${PORT}`);
});
