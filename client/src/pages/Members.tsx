import { useEffect, useState } from 'react';
import { memberApi } from '../services/api';
import type { Member, MemberRole } from '../types';

function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<MemberRole>('member');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMembers = () => {
    memberApi.getAll().then(data => {
      setMembers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      await memberApi.create({ name: formName.trim(), role: formRole });
      setFormName('');
      setFormRole('member');
      setShowModal(false);
      loadMembers();
    } catch (err) {
      console.error('添加成员失败', err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setDeletingId(id);
    try {
      await memberApi.remove(id);
      loadMembers();
    } catch (err) {
      console.error('删除成员失败', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div>
      <div className="members-page-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>团队成员</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + 添加成员
        </button>
      </div>

      <div className="members-table">
        <div className="members-table-header">
          <span>头像</span>
          <span>姓名</span>
          <span>角色</span>
          <span>操作</span>
        </div>
        {members.map(member => (
          <div key={member.id} className="members-table-row">
            <img
              src={member.avatar}
              alt={member.name}
              className="avatar avatar-large"
            />
            <span className="member-name">{member.name}</span>
            <span>
              <span className={`role-badge role-${member.role}`}>
                {member.role === 'admin' ? '管理员' : '普通成员'}
              </span>
            </span>
            <span>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteMember(member.id)}
                disabled={deletingId === member.id}
              >
                {deletingId === member.id ? '删除中...' : '删除'}
              </button>
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">添加新成员</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">姓名</label>
                <input
                  type="text"
                  className="form-input"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="请输入成员姓名"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">角色</label>
                <select
                  className="form-select"
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as MemberRole)}
                >
                  <option value="member">普通成员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={!formName.trim()}>
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
