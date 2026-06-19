export interface GetNotificationsParams {
  userId: string;
}

export interface GetUnreadCountParams {
  userId: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllAsReadRequest {
  userId: string;
}

export interface MarkAllAsReadResponse {
  updated: number;
}
