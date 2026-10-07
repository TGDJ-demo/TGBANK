import React from 'react';
import { useBank } from '../context/BankContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBank();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-container"
      data-testid="toast-notification-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        };

        const bgColors = {
          success: 'bg-slate-900 border-emerald-500/50 text-emerald-100',
          error: 'bg-slate-900 border-red-500/50 text-red-100',
          warning: 'bg-slate-900 border-amber-500/50 text-amber-100',
          info: 'bg-slate-900 border-blue-500/50 text-blue-100',
        };

        return (
          <div
            key={toast.id}
            id={`toast-message-${toast.id}`}
            data-testid={`toast-message-${toast.id}`}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-start space-x-3 transition-all transform translate-y-0 ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1">
              <p id={`toast-title-${toast.id}`} data-testid={`toast-title-${toast.id}`} className="text-xs font-bold">
                {toast.title}
              </p>
              <p id={`toast-body-${toast.id}`} data-testid={`toast-body-${toast.id}`} className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              id={`btn-close-toast-${toast.id}`}
              data-testid={`btn-close-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
