import { Complaint, ComplaintStatus, StatsResponse } from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.detail) {
        detail = data.detail;
      }
    } catch {
      // not json
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/stats`);
  return handleResponse<StatsResponse>(res);
}

export async function getComplaint(issueId: string): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(issueId.trim())}`);
  return handleResponse<Complaint>(res);
}

export async function submitComplaint(data: {
  title: string;
  description: string;
  category: string;
  location: string;
  citizen_name?: string;
  citizen_phone?: string;
}): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Complaint>(res);
}

export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ passcode: passcode.trim() }),
  });
  if (!res.ok) {
    return false;
  }
  const data = await res.json();
  return Boolean(data && data.valid);
}

export async function getAdminComplaints(
  passcode: string,
  status?: string,
  search?: string
): Promise<Complaint[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') {
    params.set('status', status);
  }
  if (search && search.trim()) {
    params.set('search', search.trim());
  }

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/complaints${queryStr}`, {
    headers: {
      'X-Admin-Passcode': passcode.trim(),
    },
  });
  return handleResponse<Complaint[]>(res);
}

export async function updateComplaintStatus(
  issueId: string,
  status: ComplaintStatus,
  note: string,
  passcode: string
): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(issueId.trim())}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Passcode': passcode.trim(),
    },
    body: JSON.stringify({ status, note }),
  });
  return handleResponse<Complaint>(res);
}
