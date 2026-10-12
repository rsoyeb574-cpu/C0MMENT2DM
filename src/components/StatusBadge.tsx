import React from 'react';
import { AppStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, ShieldAlert, Sparkles, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AppStatus;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
  showIcon = true,
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'Demo mode':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />}
          <span>Demo mode</span>
        </span>
      );

    case 'Setup required':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses} ${className}`}
        >
          {showIcon && <Clock className="w-3 h-3 text-slate-400 shrink-0" />}
          <span>Setup required</span>
        </span>
      );

    case 'Connected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
          <span>Connected</span>
        </span>
      );

    case 'Waiting for authorization':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <RefreshCw className="w-3 h-3 text-sky-400 shrink-0 animate-spin" />}
          <span>Waiting for authorization</span>
        </span>
      );

    case 'Processing':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <RefreshCw className="w-3 h-3 text-purple-400 shrink-0 animate-spin" />}
          <span>Processing</span>
        </span>
      );

    case 'Sent successfully':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
          <span>Sent successfully</span>
        </span>
      );

    case 'Failed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <XCircle className="w-3 h-3 text-rose-400 shrink-0" />}
          <span>Failed</span>
        </span>
      );

    case 'Needs attention':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />}
          <span>Needs attention</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses} ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
