import React, { useState } from 'react';
import { StatsResponse, Complaint } from '../types';
import { CivicStatsBar } from '../components/CivicStatsBar';
import { IssueIdPill } from '../components/IssueIdPill';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Send,
  Eye,
  Wrench,
} from 'lucide-react';

interface HomePageProps {
  stats: StatsResponse | null;
  loadingStats: boolean;
  onNavigate: (page: 'home' | 'submit' | 'track' | 'admin', issueId?: string) => void;
  sampleComplaints: Complaint[];
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  loadingStats,
  onNavigate,
  sampleComplaints,
}) => {
  const [quickTrackId, setQuickTrackId] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackId.trim()) return;
    onNavigate('track', quickTrackId.trim().toUpperCase());
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/civic_hero_cityhall_1791127967494.jpg"
            alt="Civic center architecture"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 py-14 sm:px-12 sm:py-20 lg:py-24">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4 bg-sky-950/60 border border-sky-800/80 px-3 py-1 rounded-md">
            <Shield size={14} />
            <span>Public Infrastructure & Municipal Transparency</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.12]">
            Report municipal issues. <br className="hidden sm:inline" />
            <span className="text-sky-400">Track resolution</span> in real time.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Every citizen complaint is assigned a permanent Issue ID. Watch your report move through each stage of city review, field crew dispatch, and verified completion.
          </p>

          {/* Quick Track Input Bar */}
          <div className="mt-8 max-w-xl">
            <form
              onSubmit={handleQuickTrack}
              className="bg-white/10 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-white/20 flex flex-col sm:flex-row items-stretch gap-2 shadow-2xl"
            >
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value.toUpperCase())}
                  placeholder="Enter Issue ID (e.g. CC-55731)..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm font-mono tracking-wide text-white placeholder:text-slate-400 placeholder:font-sans bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <span>Track Issue</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-slate-300 font-sans">Sample IDs:</span>
              {['CC-55731', 'CC-24815', 'CC-60418'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate('track', id)}
                  className="hover:text-white underline decoration-slate-600 hover:decoration-white transition-colors cursor-pointer"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Civic KPI Stats Bar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
            Live City-Wide Resolution Indicators
          </h2>
          <span className="text-xs text-slate-500 font-mono">Updated continuously</span>
        </div>
        <CivicStatsBar stats={stats} loading={loadingStats} />
      </section>

      {/* The 5-State Civic Status Lifecycle Explainer */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            The Civic Connect Status Lifecycle
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Unlike opaque municipal backlogs, our tracker enforces a deterministic 5-state lifecycle. Every transition appends an immutable timestamped event to the public audit log.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Stage 1 */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <StatusBadge status="SUBMITTED" size="sm" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Submitted</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizen submits complaint with location, description, and contact info. System provisions a unique CC-XXXXX Issue ID.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <StatusBadge status="UNDER REVIEW" size="sm" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Under Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal triage officers inspect the issue, evaluate jurisdiction, check priority, and assign to the relevant department.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <StatusBadge status="IN PROGRESS" size="sm" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1.5">In Progress</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field work crews, sanitation trucks, or electrical contractors are dispatched on-site with active work orders.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <StatusBadge status="RESOLVED" size="sm" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1.5">Resolved</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Physical repairs or service remediation verified by municipal inspection. The issue is officially closed.
            </p>
          </div>
        </div>

        {/* Terminal Off-ramp REJECTED */}
        <div className="mt-4 border border-rose-200/90 rounded-xl p-4 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-rose-950">Terminal Off-Ramp:</span>
                <StatusBadge status="REJECTED" size="sm" />
              </div>
              <p className="text-rose-800 mt-0.5">
                Issues deemed duplicates, non-actionable, or outside city jurisdiction are formally dismissed with an officer rationale note to keep public records clean.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('track', 'CC-60418')}
            className="text-rose-900 font-semibold underline shrink-0 hover:text-rose-950 cursor-pointer"
          >
            View Sample Rejection (CC-60418)
          </button>
        </div>
      </section>

      {/* Featured Trackable Complaints Feed */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Active Municipal Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Recently filed civic reports undergoing city triage and field work
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('submit')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>File a new complaint</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleComplaints.slice(0, 6).map((c) => (
            <div
              key={c.issue_id}
              onClick={() => onNavigate('track', c.issue_id)}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <IssueIdPill issueId={c.issue_id} size="sm" />
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700 truncate max-w-[160px]">
                  {c.category}
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
