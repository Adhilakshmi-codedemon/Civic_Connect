export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'IN PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface StatusHistoryEvent {
  status: ComplaintStatus;
  note: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  issue_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  citizen_name?: string;
  citizen_phone?: string;
  status: ComplaintStatus;
  history: StatusHistoryEvent[];
  created_at: string;
  updated_at: string;
}

export interface StatsResponse {
  total: number;
  submitted: number;
  under_review: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  resolution_rate: number;
  avg_resolution_hours: number;
}

export const CATEGORIES = [
  'Roads & Potholes',
  'Street Lighting',
  'Waste & Sanitation',
  'Water & Sewage',
  'Parks & Public Spaces',
  'Traffic & Signals',
  'Public Safety',
  'Other',
] as const;

export type ComplaintCategory = (typeof CATEGORIES)[number];
