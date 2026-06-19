const STATUS_LABELS: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
};

const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return '刚刚';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString('zh-CN');
};

const buildActivityText = (activity: { type: string; payload: Record<string, any>; actorName: string }): string => {
  const { type, payload, actorName } = activity;
  switch (type) {
    case 'task_created':
      return `${actorName} 创建了任务 "${payload.taskTitle}"`;
    case 'task_moved':
      return `${actorName} 将 "${payload.taskTitle}" 移至 ${STATUS_LABELS[payload.toStatus] || payload.toStatus}`;
    case 'member_joined':
      return `${payload.memberName} 加入了项目`;
    case 'member_left':
      return `${payload.memberName} 退出了项目`;
    default:
      return `${actorName} 执行了操作`;
  }
};

export { STATUS_LABELS, formatRelativeTime, buildActivityText };
