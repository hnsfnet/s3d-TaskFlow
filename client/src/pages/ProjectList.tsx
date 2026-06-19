import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useMembers } from '../hooks';

function ProjectList() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, loadProjects } = useProjects();
  const { members, loading: membersLoading, loadMembers, getMemberById } = useMembers();

  useEffect(() => {
    loadProjects();
    loadMembers();
  }, [loadProjects, loadMembers]);

  const loading = projectsLoading || membersLoading;

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div>
      <h1 className="page-title">项目列表</h1>
      <div className="project-grid">
        {projects.map(project => {
          const projectMembers = project.memberIds
            .map(id => getMemberById(id))
            .filter(Boolean);
          return (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-header">
                <div className="project-card-name">{project.name}</div>
                <div className="project-card-date">创建于 {project.createdAt}</div>
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-label">
                  <span>完成进度</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="project-members">
                <div className="avatar-group">
                  {projectMembers.slice(0, 4).map(member => member && (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.name}
                      className="avatar"
                      title={member.name}
                    />
                  ))}
                </div>
                {projectMembers.length > 4 && (
                  <span style={{ fontSize: '13px', color: '#718096', marginLeft: '8px' }}>
                    +{projectMembers.length - 4}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectList;
