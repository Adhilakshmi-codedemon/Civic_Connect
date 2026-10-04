import React from 'react';

interface FooterProps {
  onNavigate: (page: 'home' | 'submit' | 'track' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2 md:col-span-1">
            <span className="font-bold text-slate-900 text-sm">Civic Connect</span>
            <p className="text-slate-500 leading-relaxed">
              Open civic complaint resolution system. Providing real-time auditability and transparent status lifecycles for urban infrastructure and public services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('submit')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  File Infrastructure Complaint
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Track by Issue ID (CC-XXXXX)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-slate-900 transition-colors text-left"
                >
                  Public Transparency Metrics
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3">
              Municipal Departments
            </h4>
            <ul className="space-y-1.5 text-slate-600">
              <li>Public Works & Roads</li>
              <li>Bureau of Sanitation & Waste</li>
              <li>Water Supply & Wastewater</li>
              <li>Municipal Electrical Grid</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3">
              Staff Portal & Verification
            </h4>
            <p className="text-slate-500 leading-relaxed mb-2">
              City officials and field triage supervisors access the desk via passcode authentication.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
              Demo passcode: <code className="font-bold text-slate-900">admin123</code>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <div>
            © {new Date().getFullYear()} Municipal Citizen Portal · Civic Connect
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
