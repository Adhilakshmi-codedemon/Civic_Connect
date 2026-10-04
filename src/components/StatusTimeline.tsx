import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle2,
  Clock,
  Eye,
  Wrench,
  AlertTriangle,
  History,
} from 'lucide-react';

interface StatusTimelineProps {
  complaint: Complaint;
}

const ORDERED_STEPS: { status: ComplaintStatus; label: string; icon: React.ElementType }[] = [
  { status: 'SUBMITTED', label: 'Submitted', icon: Clock },
  { status: 'UNDER REVIEW', label: 'Under Review', icon: Eye },
  { status: 'IN PROGRESS', label: 'In Progress', icon: Wrench },
  { status: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ complaint }) => {
  const isRejected = complaint.status === 'REJECTED';

  // Determine current step index in standard flow
  const currentStepIndex = ORDERED_STEPS.findIndex((s) => s.status === complaint.status);

  // Find rejection event if applicable
  const rejectionEvent = isRejected
    ? complaint.history.slice().reverse().find((h) => h.status === 'REJECTED')
    : undefined;

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* If REJECTED, show high-visibility rejection banner */}
      {isRejected && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-rose-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-rose-100 p-2 text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-rose-950 text-base">
                  Complaint Formally Rejected
                </h4>
                <span className="text-xs font-mono text-rose-700 tabular-nums">
                  {rejectionEvent ? formatDate(rejectionEvent.timestamp) : ''}
                </span>
              </div>
              <p className="text-sm text-rose-800 leading-relaxed">
                {rejectionEvent?.note ||
                  'This complaint has been reviewed and determined to be outside municipal jurisdiction, non-actionable, or a duplicate entry.'}
              </p>
              <div className="pt-1 text-xs text-rose-600">
                This is a terminal determination. If you believe this was processed in error, please contact the municipal ombudsman or submit a new filing with additional documentation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Progress Pipeline */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Municipal Resolution Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent 4-stage civic lifecycle tracked in real time
            </p>
          </div>
          <StatusBadge status={complaint.status} size="md" />
        </div>

        {/* Stepper track */}
        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden md:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
            {ORDERED_STEPS.map((step, idx) => {
              const Icon = step.icon;
              let isCompleted = false;
              let isCurrent = false;

              if (isRejected) {
                // In rejected mode, check which steps happened before rejection
                const stepEvent = complaint.history.find((h) => h.status === step.status);
                isCompleted = Boolean(stepEvent);
                isCurrent = false;
              } else {
                if (currentStepIndex >= 0) {
                  if (idx < currentStepIndex) {
                    isCompleted = true;
                  } else if (idx === currentStepIndex) {
                    isCurrent = true;
                  }
                }
              }

              // Find timestamp if reached
              const matchedHistory = complaint.history.find((h) => h.status === step.status);

              return (
                <div key={step.status} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-slate-900 border-slate-900 text-white ring-4 ring-slate-100'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>

                  <div className="flex-1 md:w-full">
                    <div className="flex items-center gap-2 md:justify-center">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {matchedHistory ? (
                      <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5 md:mx-auto">
                        {formatDate(matchedHistory.timestamp)}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5 md:mx-auto">
                        {isRejected ? 'Bypassed' : 'Pending stage'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complete Audit Log */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <History size={18} className="text-slate-500" />
          <h3 className="text-base font-semibold">Status Event Audit Trail</h3>
          <span className="text-xs font-mono text-slate-600 ml-auto tabular-nums">
            {complaint.history.length} {complaint.history.length === 1 ? 'event' : 'events'} logged
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {complaint.history
            .slice()
            .reverse()
            .map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ${
                    idx === 0
                      ? 'bg-slate-900 ring-slate-400'
                      : 'bg-slate-300 ring-slate-100'
                  }`}
                />

                <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-4 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <StatusBadge status={event.status} size="sm" />
                    <span className="text-xs font-mono text-slate-600 tabular-nums">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {event.note}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
