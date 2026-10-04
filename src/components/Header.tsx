import React from 'react';
import { PlusCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'submit' | 'track' | 'admin';
  onNavigate: (page: 'home' | 'submit' | 'track' | 'admin') => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isAdminLoggedIn = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title, single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
        >
          Civic Connect
        </button>

        {/* Zone 2: 4 nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-slate-900 cursor-pointer ${
              currentPage === 'home' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('submit')}
            className={`transition-colors hover:text-slate-900 cursor-pointer ${
              currentPage === 'submit' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Submit Complaint
          </button>
          <button
            type="button"
            onClick={() => onNavigate('track')}
            className={`transition-colors hover:text-slate-900 cursor-pointer ${
              currentPage === 'track' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Track Status
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`transition-colors hover:text-slate-900 cursor-pointer flex items-center gap-1.5 ${
              currentPage === 'admin' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            <ShieldCheck size={14} className={isAdminLoggedIn ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Admin Desk</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('submit')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <PlusCircle size={14} />
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    </header>
  );
};
