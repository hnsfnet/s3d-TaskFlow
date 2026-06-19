import { http } from '../http';
import type { Member } from '../../types';
import type { CreateMemberRequest, DeleteMemberParams } from '../types/member';

export const memberApi = {
  getAll: () => http.get<Member[]>('/members').then(r => r.data),

  create: (data: CreateMemberRequest) =>
    http.post<Member>('/members', data).then(r => r.data),

  remove: (id: string, params?: DeleteMemberParams) =>
    http.delete(`/members/${id}`, { params }).then(r => r.data),
};

export default memberApi;
