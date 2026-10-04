import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { IssueIdPill } from './IssueIdPill';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  X,
} from 'lucide-react';
import { StatusTimeline } from './StatusTimeline';

interface AdminTriageTableProps {
  complaints: Complaint[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (
    issueId: string,
    newStatus: ComplaintStatus,
    note: string
  ) => Promise<boolean>;
  onSelectComplaint?: (issueId: string) => void;
}

const ALL_STATUSES: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER REVIEW',
  'IN PROGRESS',
  'RESOLVED',
  'REJECTED',
];

export const AdminTriageTable: React.FC<AdminTriageTableProps> = ({
  complaints,
  loading,
  onRefresh,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Per-row state for status changes
  const [rowStatus, setRowStatus] = useState<Record<string, ComplaintStatus>>({});
  const [rowNotes, setRowNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeNoteModal, setActiveNoteModal] = useState<Complaint | null>(null);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.issue_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      (c.citizen_name && c.citizen_name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const handleStatusSelect = (issueId: string, currentStatus: ComplaintStatus, newStatus: ComplaintStatus) => {
    if (newStatus === currentStatus) {
      toast.error(`Complaint is already in '${currentStatus}' status.`);
      return;
    }
    setRowStatus((prev) => ({ ...prev, [issueId]: newStatus }));
  };

  const handleExecuteUpdate = async (complaint: Complaint) => {
    const targetStatus = rowStatus[complaint.issue_id] || complaint.status;
    const note = rowNotes[complaint.issue_id] || '';

    if (targetStatus === complaint.status) {
      toast.error('Please select a different status to update.', {
        description: `Current status is ${complaint.status}. Same-status updates are blocked.`,
      });
      return;
    }

    setUpdatingId(complaint.issue_id);
    try {
      const success = await onUpdateStatus(complaint.issue_id, targetStatus, note);
      if (success) {
        // clear local row overrides
        setRowStatus((prev) => {
          const next = { ...prev };
          delete next[complaint.issue_id];
          return next;
        });
        setRowNotes((prev) => {
          const next = { ...prev };
          delete next[complaint.issue_id];
          return next;
        });
        setActiveNoteModal(null);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Issue ID, citizen, title or location..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <span className="text-slate-600 px-2 py-1 hidden sm:inline flex items-center gap-1">
              <Filter size={12} /> Filter:
            </span>
            {['ALL', ...ALL_STATUSES].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Complaints Queue"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Issue ID</th>
                <th className="py-3 px-4">Complaint & Citizen</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Status Transition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-slate-400" />
                        <span>Loading triage records...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-700">No complaints found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your search query or status filter.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((complaint) => {
                  const currentSt = complaint.status;
                  const selectedSt = rowStatus[complaint.issue_id] || currentSt;
                  const hasStatusChanged = selectedSt !== currentSt;
                  const isUpdating = updatingId === complaint.issue_id;

                  return (
                    <tr
                      key={complaint.issue_id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Issue ID */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <IssueIdPill issueId={complaint.issue_id} withCopy size="sm" />
                        <div className="text-[11px] text-slate-600 mt-1 font-mono tabular-nums">
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(complaint.created_at))}
                        </div>
                      </td>

                      {/* Complaint title & details */}
                      <td className="py-3.5 px-4 align-top max-w-xs sm:max-w-sm">
                        <div className="font-medium text-slate-900 leading-snug">
                          {complaint.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-medium text-slate-600">{complaint.category}</span>
                          <span>·</span>
                          <span className="truncate">
                            {complaint.citizen_name || 'Anonymous'}
                            {complaint.citizen_phone ? ` (${complaint.citizen_phone})` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 align-top text-xs text-slate-600 max-w-[200px]">
                        <span className="line-clamp-2">{complaint.location}</span>
                      </td>

                      {/* Current Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <StatusBadge status={complaint.status} size="sm" />
                      </td>

                      {/* Status Transition Control */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedSt}
                            onChange={(e) =>
                              handleStatusSelect(
                                complaint.issue_id,
                                currentSt,
                                e.target.value as ComplaintStatus
                              )
                            }
                            className={`text-xs py-1.5 px-2.5 rounded-lg border focus:outline-none transition-colors ${
                              hasStatusChanged
                                ? 'border-slate-900 bg-slate-900 text-white font-medium'
                                : 'border-slate-200 bg-white text-slate-800'
                            }`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option
                                key={st}
                                value={st}
                                className={st === currentSt ? 'font-bold' : ''}
                              >
                                {st} {st === currentSt ? '(Current)' : ''}
                              </option>
                            ))}
                          </select>

                          {/* Quick note trigger */}
                          <button
                            type="button"
                            onClick={() => setActiveNoteModal(complaint)}
                            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                              rowNotes[complaint.issue_id]
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                            }`}
                            title={
                              rowNotes[complaint.issue_id]
                                ? `Note attached: "${rowNotes[complaint.issue_id]}"`
                                : 'Attach staff transition note'
                            }
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>

                        {hasStatusChanged && (
                          <div className="text-[11px] text-amber-700 font-medium mt-1">
                            Pending update to {selectedSt}
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedComplaint(complaint)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Inspect full timeline and audit log"
                          >
                            <span>Inspect</span>
                            <ExternalLink size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExecuteUpdate(complaint)}
                            disabled={!hasStatusChanged || isUpdating}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              hasStatusChanged && !isUpdating
                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            <span>Update</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Transition Note Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-900 text-base">
                  Staff Status Transition Note
                </h4>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono">{activeNoteModal.issue_id}</span>
                  <span>·</span>
                  <span className="truncate">{activeNoteModal.title}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-700">
                Log Operational Note (Appended to public audit trail)
              </label>
              <textarea
                rows={3}
                value={rowNotes[activeNoteModal.issue_id] || ''}
                onChange={(e) =>
                  setRowNotes((prev) => ({
                    ...prev,
                    [activeNoteModal.issue_id]: e.target.value,
                  }))
                }
                placeholder="e.g. Dispatched Public Works repair team #4 with asphalt paver; expected completion 4:00 PM."
                className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                This note will be visible to citizens tracking this issue ID.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Save Draft Note
              </button>
              <button
                type="button"
                onClick={() => {
                  const modalComplaint = activeNoteModal;
                  setActiveNoteModal(null);
                  handleExecuteUpdate(modalComplaint);
                }}
                disabled={
                  (rowStatus[activeNoteModal.issue_id] || activeNoteModal.status) ===
                  activeNoteModal.status
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
              >
                Save & Apply Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Modal Drawer */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <IssueIdPill issueId={selectedComplaint.issue_id} withCopy size="lg" />
                <StatusBadge status={selectedComplaint.status} size="md" />
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-700 p-2 cursor-pointer rounded-lg hover:bg-slate-200/60"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
                <div className="text-xs text-slate-500 font-medium tracking-tight mb-1">
                  {selectedComplaint.category}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedComplaint.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedComplaint.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Location:</span>
                    <span className="font-medium text-slate-800">
                      {selectedComplaint.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Citizen Contact:</span>
                    <span className="font-medium text-slate-800">
                      {selectedComplaint.citizen_name || 'Anonymous'}
                      {selectedComplaint.citizen_phone
                        ? ` · ${selectedComplaint.citizen_phone}`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Timeline */}
              <StatusTimeline complaint={selectedComplaint} />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
