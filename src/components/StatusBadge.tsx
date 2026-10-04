import React from 'react';
import { ComplaintStatus } from '../types';
import { Clock, Eye, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
      icon: Clock,
    },
    'UNDER REVIEW': {
      label: 'Under Review',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      icon: Eye,
    },
    'IN PROGRESS': {
      label: 'In Progress',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
      icon: Wrench,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      icon: XCircle,
    },
  }[status] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
    icon: Clock,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses} tracking-tight select-none`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
