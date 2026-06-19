import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectApi, memberApi } from '../services/api';
import type { Project, Member } from '../types';
import KanbanBoard from '../components/KanbanBoard';

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([projectApi.getById(id), memberApi.getAll()]).then(([projectData, membersData]) => {
      setProject(projectData);
      setMembers(membersData);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="loading">加载中...</div>;
  if (!project) return <div className="empty-state">项目不存在</div>;

  const projectMembers = members.filter(m => project.memberIds.includes(m.id));

  return (
    <div>
      <Link to="/" className="back-link">← 返回项目列表</Link>
      <div className="project-detail-header">
        <h1 className="project-detail-name">{project.name}</h1>
        <p className="project-detail-desc">{project.description}</p>
        <div className="project-detail-meta">
          <div className="progress-bar-wrapper" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
            <div className="progress-bar-label">
              <span>完成进度</span>
              <span>{project.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <div className="project-detail-members">
            <span className="members-label">团队成员：</span>
            <div className="avatar-group">
              {projectMembers.map(member => (
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
      <KanbanBoard
        projectId={project.id}
        projectMembers={projectMembers}
      />
    </div>
  );
}

export default ProjectDetail;
