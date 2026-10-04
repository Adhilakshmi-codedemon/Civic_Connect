import React from 'react';
import { Complaint } from '../types';
import { StatusBadge } from './StatusBadge';
import { IssueIdPill } from './IssueIdPill';
import { MapPin, Calendar, User, ArrowRight } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  onTrack?: (issueId: string) => void;
  expanded?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onTrack,
  expanded = false,
}) => {
  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <IssueIdPill issueId={complaint.issue_id} withCopy size="sm" />
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-medium text-slate-600 tracking-tight">
            {complaint.category}
          </span>
        </div>
        <StatusBadge status={complaint.status} size="sm" />
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-semibold text-slate-900 leading-snug">
          {complaint.title}
        </h3>
        <p
          className={`text-sm text-slate-600 leading-relaxed ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {complaint.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]">{complaint.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span className="tabular-nums font-mono">{formatDate(complaint.created_at)}</span>
          </div>

          {complaint.citizen_name && (
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
              <User size={13} className="text-slate-400 shrink-0" />
              <span>{complaint.citizen_name}</span>
            </div>
          )}
        </div>

        {onTrack && (
          <button
            type="button"
            onClick={() => onTrack(complaint.issue_id)}
            className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-slate-700 transition-colors ml-auto cursor-pointer"
          >
            <span>Track Issue</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
