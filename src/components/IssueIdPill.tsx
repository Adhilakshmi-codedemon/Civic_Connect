import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface IssueIdPillProps {
  issueId: string;
  withCopy?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IssueIdPill: React.FC<IssueIdPillProps> = ({
  issueId,
  withCopy = false,
  size = 'md',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(issueId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono tracking-wider tabular-nums rounded border border-slate-300/80 bg-slate-100 text-slate-800 ${sizeClasses} ${className}`}
    >
      <span>{issueId}</span>
      {withCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
          title="Copy Issue ID"
          aria-label={`Copy Issue ID ${issueId}`}
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      )}
    </span>
  );
};
