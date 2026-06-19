import type { MemberRole } from '../types';

export interface CreateMemberRequest {
  name: string;
  role: MemberRole;
}

export interface DeleteMemberParams {
  actorId?: string;
}
