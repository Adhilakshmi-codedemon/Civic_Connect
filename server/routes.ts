import { Router, Request, Response, NextFunction } from 'express';
import { store } from './storage.js';
import { ComplaintStatus } from './types.js';

export const apiRouter = Router();

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';

const VALID_STATUSES: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER REVIEW',
  'IN PROGRESS',
  'RESOLVED',
  'REJECTED',
];

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const passcode = req.headers['x-admin-passcode'];
  if (!passcode || passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({ detail: 'Invalid or missing admin passcode' });
  }
  next();
}

// Health check / template status
apiRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Civic Connect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Public stats KPI
apiRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = store.getStats();
  res.json(stats);
});

// Admin verify passcode
apiRouter.post('/admin/verify', (req: Request, res: Response) => {
  const { passcode } = req.body || {};
  if (!passcode || passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({ valid: false, detail: 'Invalid admin passcode' });
  }
  res.json({ valid: true, message: 'Admin authenticated' });
});

// Public complaint registration
apiRouter.post('/complaints', (req: Request, res: Response) => {
  const { title, description, category, location, citizen_name, citizen_phone } = req.body || {};

  if (!title || !description || !category || !location) {
    return res.status(422).json({
      detail: 'Missing required fields: title, description, category, and location are mandatory.',
    });
  }

  const complaint = store.create({
    title,
    description,
    category,
    location,
    citizen_name,
    citizen_phone,
  });

  res.status(201).json(complaint);
});

// Public tracking by issue_id (case-insensitive)
apiRouter.get('/complaints/:issue_id', (req: Request, res: Response) => {
  const { issue_id } = req.params;
  if (!issue_id) {
    return res.status(422).json({ detail: 'Issue ID is required' });
  }

  const complaint = store.getByIssueId(issue_id);
  if (!complaint) {
    return res.status(404).json({ detail: `Complaint '${issue_id}' not found` });
  }

  res.json(complaint);
});

// Admin list all complaints (passcode-gated)
apiRouter.get('/complaints', adminAuthMiddleware, (req: Request, res: Response) => {
  const statusFilter = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const complaints = store.getAll(statusFilter, search);
  res.json(complaints);
});

// Admin update status (passcode-gated)
apiRouter.patch('/complaints/:issue_id/status', adminAuthMiddleware, (req: Request, res: Response) => {
  const { issue_id } = req.params;
  const { status, note } = req.body || {};

  if (!status || !VALID_STATUSES.includes(status as ComplaintStatus)) {
    return res.status(422).json({
      detail: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const result = store.updateStatus(issue_id, status as ComplaintStatus, note);

  if (result.error) {
    return res.status(result.code || 400).json({ detail: result.error });
  }

  res.json(result.complaint);
});
