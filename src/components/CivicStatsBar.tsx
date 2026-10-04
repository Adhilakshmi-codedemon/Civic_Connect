import React from 'react';
import { StatsResponse } from '../types';
import { FileText, Clock, Activity, CheckCircle2, Zap } from 'lucide-react';

interface CivicStatsBarProps {
  stats: StatsResponse | null;
  loading?: boolean;
}

export const CivicStatsBar: React.FC<CivicStatsBarProps> = ({ stats, loading = false }) => {
  const items = [
    {
      label: 'Total Registered',
      value: stats?.total ?? 0,
      icon: FileText,
      hint: 'Civic complaints on record',
    },
    {
      label: 'Under Review',
      value: stats?.under_review ?? 0,
      icon: Clock,
      hint: 'Department triage queue',
    },
    {
      label: 'In Progress',
      value: stats?.in_progress ?? 0,
      icon: Activity,
      hint: 'Crews dispatched in field',
    },
    {
      label: 'Resolved',
      value: stats?.resolved ?? 0,
      icon: CheckCircle2,
      hint: stats ? `${stats.resolution_rate}% resolution rate` : 'Closed & verified',
    },
    {
      label: 'Avg Response',
      value: stats ? `${stats.avg_resolution_hours}h` : '24h',
      icon: Zap,
      hint: 'Mean turnaround time',
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium tracking-tight text-slate-600">{item.label}</span>
                <Icon size={16} className="text-slate-400" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {loading ? (
                    <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                  ) : (
                    item.value
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 truncate">{item.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
