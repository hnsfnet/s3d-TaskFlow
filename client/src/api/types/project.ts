export interface AddProjectMemberRequest {
  memberId: string;
  actorId: string;
}

export interface RemoveProjectMemberParams {
  actorId: string;
}

export interface GetActivitiesParams {
  limit?: number;
}
