import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useProjectStore } from '../stores';
import { useMembers } from '../hooks';
import KanbanBoard from '../components/KanbanBoard';
import ActivityPanel from '../components/ActivityPanel';

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentProject, loading: projectLoading, fetchById } = useProjectStore();
  const { members, loading: membersLoading, loadMembers, getMemberById } = useMembers();

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!id) return;
    fetchById(id);
  }, [id, fetchById]);

  const loading = projectLoading || membersLoading;

  if (loading) return <div className="loading">加载中...</div>;
  if (!currentProject) return <div className="empty-state">项目不存在</div>;

  const projectMembers = useMemo(() => {
    return currentProject.memberIds
      .map(id => getMemberById(id))
      .filter(Boolean) as ReturnType<typeof getMemberById>[];
  }, [currentProject.memberIds, getMemberById, members]);

  return (
    <div>
      <Link to="/" className="back-link">← 返回项目列表</Link>
      <div className="project-detail-layout">
        <div className="project-detail-main">
          <div className="project-detail-header">
            <h1 className="project-detail-name">{currentProject.name}</h1>
            <p className="project-detail-desc">{currentProject.description}</p>
            <div className="project-detail-meta">
              <div className="progress-bar-wrapper" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
                <div className="progress-bar-label">
                  <span>完成进度</span>
                  <span>{currentProject.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${currentProject.progress}%` }} />
                </div>
              </div>
              <div className="project-detail-members">
                <span className="members-label">团队成员：</span>
                <div className="avatar-group">
                  {projectMembers.map(member => member && (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.name}
                      className="avatar avatar-large"
                      title={member.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <KanbanBoard projectId={currentProject.id} projectMembers={projectMembers.filter(Boolean) as any[]} />
        </div>
        <ActivityPanel projectId={currentProject.id} />
      </div>
    </div>
  );
}

export default ProjectDetail;
