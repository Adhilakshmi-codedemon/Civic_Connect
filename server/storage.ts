import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Complaint, ComplaintStatus, StatsResponse } from './types.js';

const DATA_FILE = path.resolve(process.cwd(), 'data/complaints.json');

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'b5a03429-16a7-471f-a392-8dbf8a7e0001',
    issue_id: 'CC-55731',
    title: 'Deep pothole at intersection of Oak & 5th Ave',
    description: 'Large pothole approximately 8 inches deep causing tire damage to vehicles turning right onto 5th Ave. Water gathers in it during rain.',
    category: 'Roads & Potholes',
    location: 'Corner of Oak St & 5th Avenue, North District',
    citizen_name: 'Marcus Vance',
    citizen_phone: '555-019-3821',
    status: 'SUBMITTED',
    history: [
      {
        status: 'SUBMITTED',
        note: 'Complaint registered by citizen via civic web portal with photographic evidence of wheel rim damage.',
        timestamp: '2026-10-03T09:15:00.000Z',
      },
    ],
    created_at: '2026-10-03T09:15:00.000Z',
    updated_at: '2026-10-03T09:15:00.000Z',
  },
  {
    id: 'b5a03429-16a7-471f-a392-8dbf8a7e0002',
    issue_id: 'CC-89104',
    title: 'Flickering streetlights along Elmwood Boulevard',
    description: 'Multiple high-pressure sodium street lamps are rapidly strobing and two are completely dark, creating hazardous blind spots on pedestrian crossings.',
    category: 'Street Lighting',
    location: 'Elmwood Blvd between 12th and 16th St',
    citizen_name: 'Elena Rostova',
    citizen_phone: '555-014-9923',
    status: 'UNDER REVIEW',
    history: [
      {
        status: 'SUBMITTED',
        note: 'Citizen reported safety concern for late evening commuters and pedestrians.',
        timestamp: '2026-10-01T19:40:00.000Z',
      },
      {
        status: 'UNDER REVIEW',
        note: 'Assigned to Municipal Electrical Grid team for circuit breaker and bulb replacement triage.',
        timestamp: '2026-10-02T08:30:00.000Z',
      },
    ],
    created_at: '2026-10-01T19:40:00.000Z',
    updated_at: '2026-10-02T08:30:00.000Z',
  },
  {
    id: 'b5a03429-16a7-471f-a392-8dbf8a7e0003',
    issue_id: 'CC-31402',
    title: 'Overflowing commercial garbage bins behind Market Square',
    description: 'Garbage bins haven\'t been collected in 4 days. Waste is spilling over into pedestrian lane attracting pests and blocking delivery access.',
    category: 'Waste & Sanitation',
    location: 'Behind 240 Market Square Alleyway',
    citizen_name: 'Devon Chen',
    citizen_phone: '555-017-4820',
    status: 'IN PROGRESS',
    history: [
      {
        status: 'SUBMITTED',
        note: 'Report submitted with sanitation priority flag.',
        timestamp: '2026-09-29T14:10:00.000Z',
      },
      {
        status: 'UNDER REVIEW',
        note: 'Route dispatch verified missed vendor collection window with contractor.',
        timestamp: '2026-09-30T09:00:00.000Z',
      },
      {
        status: 'IN PROGRESS',
        note: 'Emergency sanitation compactor vehicle dispatched to clear alleyway and replace damaged bin lid.',
        timestamp: '2026-10-02T11:20:00.000Z',
      },
    ],
    created_at: '2026-09-29T14:10:00.000Z',
    updated_at: '2026-10-02T11:20:00.000Z',
  },
  {
    id: 'b5a03429-16a7-471f-a392-8dbf8a7e0004',
    issue_id: 'CC-24815',
    title: 'Broken water main leaking on Pinecrest Road sidewalk',
    description: 'Continuous clean pressurized water bubbling up from under sidewalk pavers, undermining the curb and creating a slippery surface.',
    category: 'Water & Sewage',
    location: '412 Pinecrest Road sidewalk',
    citizen_name: 'Amina Diallo',
    citizen_phone: '555-018-7741',
    status: 'RESOLVED',
    history: [
      {
        status: 'SUBMITTED',
        note: 'Water leak reported by local resident.',
        timestamp: '2026-09-25T07:45:00.000Z',
      },
      {
        status: 'UNDER REVIEW',
        note: 'Public Works Water Division assessed leak rate as Tier 1 urgency.',
        timestamp: '2026-09-25T08:15:00.000Z',
      },
      {
        status: 'IN PROGRESS',
        note: 'Excavation crew isolated feeder line, repaired 3-inch pipe fissure, and backfilled trench.',
        timestamp: '2026-09-25T13:30:00.000Z',
      },
      {
        status: 'RESOLVED',
        note: 'Pavers re-leveled, water pressure restored, site cleared and certified safe by civil inspector.',
        timestamp: '2026-09-26T10:00:00.000Z',
      },
    ],
    created_at: '2026-09-25T07:45:00.000Z',
    updated_at: '2026-09-26T10:00:00.000Z',
  },
  {
    id: 'b5a03429-16a7-471f-a392-8dbf8a7e0005',
    issue_id: 'CC-60418',
    title: 'Request to demolish private garage on adjoining property',
    description: 'Neighbor\'s detached garage is painted an unapproved shade of blue and looks ugly from my kitchen window. Requesting municipal demolition order.',
    category: 'Other',
    location: '88 Willowbrook Terrace',
    citizen_name: 'Gregory Scott',
    citizen_phone: '555-012-3390',
    status: 'REJECTED',
    history: [
      {
        status: 'SUBMITTED',
        note: 'Complaint received regarding private property aesthetic dispute.',
        timestamp: '2026-10-02T16:05:00.000Z',
      },
      {
        status: 'REJECTED',
        note: 'Rejected: Municipal jurisdiction does not cover private structure aesthetics where no building code or safety violations exist. Private civil matter.',
        timestamp: '2026-10-03T10:15:00.000Z',
      },
    ],
    created_at: '2026-10-02T16:05:00.000Z',
    updated_at: '2026-10-03T10:15:00.000Z',
  },
];

class ComplaintsStore {
  private complaints: Map<string, Complaint> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: Complaint[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((c) => this.complaints.set(c.issue_id.toUpperCase(), c));
          return;
        }
      }
    } catch {
      // fallback to memory
    }

    // seed defaults
    INITIAL_COMPLAINTS.forEach((c) => this.complaints.set(c.issue_id.toUpperCase(), { ...c }));
    this.persist();
  }

  private persist() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(this.complaints.values()), null, 2), 'utf-8');
    } catch {
      // persist error ignored for transient env
    }
  }

  private generateIssueId(): string {
    let issueId = '';
    do {
      const num = Math.floor(10000 + Math.random() * 90000);
      issueId = `CC-${num}`;
    } while (this.complaints.has(issueId));
    return issueId;
  }

  public getAll(statusFilter?: string, search?: string): Complaint[] {
    let list = Array.from(this.complaints.values());

    if (statusFilter && statusFilter !== 'ALL') {
      const target = statusFilter.toUpperCase();
      list = list.filter((c) => c.status === target);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.issue_id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.citizen_name && c.citizen_name.toLowerCase().includes(q))
      );
    }

    // sort newest first
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getByIssueId(issueId: string): Complaint | undefined {
    return this.complaints.get(issueId.trim().toUpperCase());
  }

  public create(data: {
    title: string;
    description: string;
    category: string;
    location: string;
    citizen_name?: string;
    citizen_phone?: string;
  }): Complaint {
    const issue_id = this.generateIssueId();
    const now = new Date().toISOString();

    const complaint: Complaint = {
      id: randomUUID(),
      issue_id,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      location: data.location.trim(),
      citizen_name: data.citizen_name?.trim() || 'Anonymous Citizen',
      citizen_phone: data.citizen_phone?.trim() || '',
      status: 'SUBMITTED',
      history: [
        {
          status: 'SUBMITTED',
          note: 'Complaint registered by citizen via civic portal',
          timestamp: now,
        },
      ],
      created_at: now,
      updated_at: now,
    };

    this.complaints.set(issue_id, complaint);
    this.persist();
    return complaint;
  }

  public updateStatus(
    issueId: string,
    newStatus: ComplaintStatus,
    note?: string
  ): { error?: string; code?: number; complaint?: Complaint } {
    const key = issueId.trim().toUpperCase();
    const complaint = this.complaints.get(key);

    if (!complaint) {
      return { error: 'Complaint not found', code: 404 };
    }

    if (complaint.status === newStatus) {
      return { error: `Cannot update to the same status (${newStatus})`, code: 400 };
    }

    const now = new Date().toISOString();
    const defaultNote = `Status updated to ${newStatus}`;
    const entryNote = note && note.trim() ? note.trim() : defaultNote;

    complaint.status = newStatus;
    complaint.updated_at = now;
    complaint.history.push({
      status: newStatus,
      note: entryNote,
      timestamp: now,
    });

    this.complaints.set(key, complaint);
    this.persist();
    return { complaint };
  }

  public getStats(): StatsResponse {
    const all = Array.from(this.complaints.values());
    const total = all.length;
    let submitted = 0;
    let under_review = 0;
    let in_progress = 0;
    let resolved = 0;
    let rejected = 0;

    let totalResolutionHours = 0;
    let resolvedCountWithTime = 0;

    for (const c of all) {
      switch (c.status) {
        case 'SUBMITTED':
          submitted++;
          break;
        case 'UNDER REVIEW':
          under_review++;
          break;
        case 'IN PROGRESS':
          in_progress++;
          break;
        case 'RESOLVED': {
          resolved++;
          const created = new Date(c.created_at).getTime();
          const resolvedTime = new Date(c.updated_at).getTime();
          if (resolvedTime > created) {
            totalResolutionHours += (resolvedTime - created) / (1000 * 60 * 60);
            resolvedCountWithTime++;
          }
          break;
        }
        case 'REJECTED':
          rejected++;
          break;
      }
    }

    const nonRejected = total - rejected;
    const resolution_rate = nonRejected > 0 ? Math.round((resolved / nonRejected) * 100) : 0;
    const avg_resolution_hours =
      resolvedCountWithTime > 0 ? Math.round((totalResolutionHours / resolvedCountWithTime) * 10) / 10 : 26.5;

    return {
      total,
      submitted,
      under_review,
      in_progress,
      resolved,
      rejected,
      resolution_rate,
      avg_resolution_hours,
    };
  }
}

export const store = new ComplaintsStore();
