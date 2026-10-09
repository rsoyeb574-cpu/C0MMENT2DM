import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-slate-900 border border-slate-700/80 shadow-xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <p className="flex-1 text-slate-200 leading-relaxed">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
