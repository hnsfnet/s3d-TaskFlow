import { http } from '../http';
import type { Project, Activity } from '../../types';
import type {
  AddProjectMemberRequest,
  RemoveProjectMemberParams,
  GetActivitiesParams,
} from '../types/project';

export const projectApi = {
  getAll: () => http.get<Project[]>('/projects').then(r => r.data),

  getById: (id: string) => http.get<Project>(`/projects/${id}`).then(r => r.data),

  addMember: (projectId: string, data: AddProjectMemberRequest) =>
    http.post<Project>(`/projects/${projectId}/members`, data).then(r => r.data),

  removeMember: (projectId: string, memberId: string, params: RemoveProjectMemberParams) =>
    http.delete<Project>(`/projects/${projectId}/members/${memberId}`, { params }).then(r => r.data),

  getActivities: (projectId: string, params?: GetActivitiesParams) =>
    http.get<Activity[]>(`/projects/${projectId}/activities`, { params }).then(r => r.data),
};

export default projectApi;
