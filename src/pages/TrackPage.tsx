import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { getComplaint } from '../api';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { IssueIdPill } from '../components/IssueIdPill';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Share2,
  Check,
} from 'lucide-react';

interface TrackPageProps {
  initialIssueId?: string;
  onNavigate: (page: 'home' | 'submit' | 'track' | 'admin', issueId?: string) => void;
}

export const TrackPage: React.FC<TrackPageProps> = ({
  initialIssueId,
  onNavigate,
}) => {
  const [searchInput, setSearchInput] = useState(initialIssueId || '');
  const [currentIssueId, setCurrentIssueId] = useState(initialIssueId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const sampleIds = [
    { id: 'CC-55731', label: 'Submitted' },
    { id: 'CC-89104', label: 'Under Review' },
    { id: 'CC-31402', label: 'In Progress' },
    { id: 'CC-24815', label: 'Resolved' },
    { id: 'CC-60418', label: 'Rejected' },
  ];

  const fetchComplaintData = async (issueId: string) => {
    if (!issueId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getComplaint(issueId.trim());
      setComplaint(data);
      setCurrentIssueId(data.issue_id);
      setSearchInput(data.issue_id);
    } catch (err: any) {
      setComplaint(null);
      setError(
        err?.detail ||
          `No municipal record found for "${issueId}". Please check your Issue ID and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialIssueId) {
      setSearchInput(initialIssueId);
      fetchComplaintData(initialIssueId);
    }
  }, [initialIssueId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchComplaintData(searchInput.trim());
  };

  const handleCopyShareLink = () => {
    if (!complaint) return;
    const url = new URL(window.location.href);
    url.searchParams.set('issue', complaint.issue_id);
    navigator.clipboard.writeText(url.toString());
    setLinkCopied(true);
    toast.success('Tracking URL copied to clipboard');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Title & Search bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Track Complaint Status
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your CC-XXXXX Issue ID to check triage state, field work progress, and municipal updates.
          </p>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="e.g. CC-55731"
              className="w-full pl-10 pr-4 py-2.5 font-mono text-sm uppercase bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            <span>Track</span>
          </button>
        </form>

        {/* Quick Demo Seed Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Demo Samples:</span>
          {sampleIds.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSearchInput(item.id);
                fetchComplaintData(item.id);
              }}
              className={`px-2.5 py-1 rounded-md border font-mono transition-all cursor-pointer ${
                currentIssueId === item.id
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>{item.id}</span>
              <span className="font-sans ml-1 text-slate-400 font-normal">({item.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <RefreshCw size={24} className="animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-700">Retrieving official municipal record...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-900 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <h3 className="font-semibold text-base">Record Not Found</h3>
          </div>
          <p className="text-sm text-rose-800 leading-relaxed">{error}</p>
          <div className="pt-2 text-xs text-rose-700">
            Ensure you have entered the 5-digit number preceded by "CC-" (e.g. CC-55731). If you recently submitted, check your confirmation receipt.
          </div>
        </div>
      )}

      {/* Complaint details & Timeline */}
      {!loading && complaint && (
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <IssueIdPill issueId={complaint.issue_id} withCopy size="lg" />
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600 tracking-tight uppercase">
                  {complaint.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Share link"
                >
                  {linkCopied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={13} />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <StatusBadge status={complaint.status} size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {complaint.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 font-medium">Incident Location</span>
                  <span className="font-medium text-slate-800">{complaint.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 font-medium">Date Registered</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    {formatDate(complaint.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 font-medium">Citizen Contact</span>
                  <span className="font-medium text-slate-800">
                    {complaint.citizen_name || 'Anonymous Citizen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Status Timeline & Audit Trail */}
          <StatusTimeline complaint={complaint} />
        </div>
      )}

      {/* Initial empty state when no complaint searched yet */}
      {!loading && !complaint && !error && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">Enter an Issue ID to Begin</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            You can copy and paste an ID from your confirmation screen or try one of the quick samples above.
          </p>
        </div>
      )}
    </div>
  );
};
