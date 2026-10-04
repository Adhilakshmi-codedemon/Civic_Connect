import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SubmitPage } from './pages/SubmitPage';
import { TrackPage } from './pages/TrackPage';
import { AdminPage } from './pages/AdminPage';
import { Complaint, StatsResponse } from './types';
import { getStats, getComplaint } from './api';
import { Toaster, toast } from 'sonner';

type Page = 'home' | 'submit' | 'track' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [trackIssueId, setTrackIssueId] = useState<string>('');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [sampleComplaints, setSampleComplaints] = useState<Complaint[]>([]);

  // Parse path & search params on mount
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const issue = params.get('issue');

      if (path === '/submit') {
        setCurrentPage('submit');
      } else if (path === '/track') {
        setCurrentPage('track');
        if (issue) {
          setTrackIssueId(issue.toUpperCase());
        }
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
        if (issue) {
          // If at root with ?issue=, redirect to track view
          setCurrentPage('track');
          setTrackIssueId(issue.toUpperCase());
        }
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Fetch initial public stats and seed sample complaints
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingStats(true);
      try {
        const statsData = await getStats();
        setStats(statsData);
      } catch {
        // quiet fallback
      } finally {
        setLoadingStats(false);
      }

      // Pre-fetch some sample complaints for the feed
      const sampleIds = ['CC-55731', 'CC-89104', 'CC-31402', 'CC-24815', 'CC-60418'];
      const loaded: Complaint[] = [];
      for (const id of sampleIds) {
        try {
          const c = await getComplaint(id);
          if (c) loaded.push(c);
        } catch {
          // ignore
        }
      }
      setSampleComplaints(loaded);
    };

    loadInitialData();
  }, []);

  const navigateTo = (page: Page, issueId?: string) => {
    setCurrentPage(page);
    let path = '/';
    let query = '';

    if (page === 'submit') {
      path = '/submit';
    } else if (page === 'track') {
      path = '/track';
      if (issueId) {
        setTrackIssueId(issueId.toUpperCase());
        query = `?issue=${encodeURIComponent(issueId.toUpperCase())}`;
      }
    } else if (page === 'admin') {
      path = '/admin';
    }

    try {
      window.history.pushState({}, '', `${path}${query}`);
    } catch {
      // ignore
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintCreated = (complaint: Complaint) => {
    setSampleComplaints((prev) => [complaint, ...prev]);
    getStats().then(setStats).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-slate-900 selection:text-white antialiased">
      <Toaster richColors position="top-right" />

      {/* Top Bar Navigation */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        isAdminLoggedIn={Boolean(sessionStorage.getItem('civic_connect_admin_passcode'))}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentPage === 'home' && (
          <HomePage
            stats={stats}
            loadingStats={loadingStats}
            onNavigate={navigateTo}
            sampleComplaints={sampleComplaints}
          />
        )}

        {currentPage === 'submit' && (
          <SubmitPage
            onNavigate={navigateTo}
            onComplaintCreated={handleComplaintCreated}
          />
        )}

        {currentPage === 'track' && (
          <TrackPage
            initialIssueId={trackIssueId}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage onNavigate={navigateTo} />
        )}
      </main>

      {/* Site Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
