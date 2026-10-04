import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, StatsResponse } from '../types';
import {
  verifyAdminPasscode,
  getAdminComplaints,
  updateComplaintStatus,
  getStats,
} from '../api';
import { CivicStatsBar } from '../components/CivicStatsBar';
import { AdminTriageTable } from '../components/AdminTriageTable';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: 'home' | 'submit' | 'track' | 'admin', issueId?: string) => void;
}

const STORAGE_KEY = 'civic_connect_admin_passcode';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Check saved session
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPasscode(saved);
      verifyAndLoad(saved);
    }
  }, []);

  const verifyAndLoad = async (code: string) => {
    setCheckingAuth(true);
    setAuthError(null);
    try {
      const valid = await verifyAdminPasscode(code);
      if (valid) {
        setAuthenticated(true);
        sessionStorage.setItem(STORAGE_KEY, code);
        loadData(code);
      } else {
        setAuthenticated(false);
        sessionStorage.removeItem(STORAGE_KEY);
        setAuthError('Incorrect admin passcode. Please try again.');
      }
    } catch {
      setAuthenticated(false);
      setAuthError('Failed to verify passcode with civic server.');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter the admin passcode.');
      return;
    }
    verifyAndLoad(passcode.trim());
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPasscode('');
    sessionStorage.removeItem(STORAGE_KEY);
    setComplaints([]);
    toast.info('Admin session signed out.');
  };

  const loadData = async (code: string) => {
    setLoadingComplaints(true);
    try {
      const [complaintsData, statsData] = await Promise.all([
        getAdminComplaints(code),
        getStats(),
      ]);
      setComplaints(complaintsData);
      setStats(statsData);
    } catch (err: any) {
      toast.error(err?.detail || 'Failed to load complaints queue');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleUpdateStatus = async (
    issueId: string,
    newStatus: ComplaintStatus,
    note: string
  ): Promise<boolean> => {
    try {
      const updated = await updateComplaintStatus(issueId, newStatus, note, passcode);
      toast.success(`Complaint ${issueId} updated to ${newStatus}`);

      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.issue_id === updated.issue_id ? updated : c))
      );

      // Refresh stats
      getStats().then(setStats).catch(() => {});
      return true;
    } catch (err: any) {
      toast.error(err?.detail || 'Failed to update complaint status');
      return false;
    }
  };

  // Passcode Gate View
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Municipal Staff Authentication
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Access the triage desk to evaluate citizen complaints, update work states, and log field notes.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Admin Passcode</span>
                <span className="text-[11px] font-normal text-slate-400">Environment key</span>
              </label>

              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter passcode..."
                  className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {authError && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle size={13} />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            {/* Demo Hint Banner (per specification) */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <span className="font-semibold shrink-0">Demo Hint:</span>
              <span>
                Default passcode is <code className="bg-amber-100 font-mono font-bold px-1 py-0.5 rounded text-amber-950">admin123</code>.
              </span>
            </div>

            <button
              type="submit"
              disabled={checkingAuth}
              className="w-full py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {checkingAuth ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Access Admin Desk</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Desk View
  return (
    <div className="space-y-8 pb-12">
      {/* Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              <ShieldCheck size={12} />
              <span>Staff Authenticated</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Triage Session Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Municipal Complaint Triage Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Review citizen complaints, manage department dispatching, update status milestones, and log transparent audit records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          City Department Overview
        </h2>
        <CivicStatsBar stats={stats} loading={loadingComplaints} />
      </div>

      {/* Complaints Triage Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Complaints Management Queue ({complaints.length})
          </h2>
          <span className="text-xs text-slate-500">
            Directly update status and append timestamped notes to the public ledger
          </span>
        </div>

        <AdminTriageTable
          complaints={complaints}
          loading={loadingComplaints}
          onRefresh={() => loadData(passcode)}
          onUpdateStatus={handleUpdateStatus}
          onSelectComplaint={(issueId) => onNavigate('track', issueId)}
        />
      </div>
    </div>
  );
};
