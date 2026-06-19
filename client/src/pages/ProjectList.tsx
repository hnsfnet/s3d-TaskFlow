import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi, memberApi } from '../services/api';
import type { Project, Member } from '../types';

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([projectApi.getAll(), memberApi.getAll()]).then(([projectsData, membersData]) => {
      setProjects(projectsData);
      setMembers(membersData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div>
      <h1 className="page-title">项目列表</h1>
      <div className="project-grid">
        {projects.map(project => {
          const projectMembers = members.filter(m => project.memberIds.includes(m.id));
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
                  {projectMembers.slice(0, 4).map(member => (
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
