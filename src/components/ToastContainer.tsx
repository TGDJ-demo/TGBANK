import React, { useEffect } from 'react';
import { useBank } from '../context/BankContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBank();

  useEffect(() => {
    if (toasts.length === 0) return;

    const dismissOnOutsideInteraction = (event: Event) => {
      if (event.target instanceof Node && document.getElementById('toast-notification-container')?.contains(event.target)) {
        return;
      }
      toasts.forEach((toast) => removeToast(toast.id));
    };

    document.addEventListener('pointerdown', dismissOnOutsideInteraction);
    document.addEventListener('keydown', dismissOnOutsideInteraction);
    document.addEventListener('focusin', dismissOnOutsideInteraction);

    return () => {
      document.removeEventListener('pointerdown', dismissOnOutsideInteraction);
      document.removeEventListener('keydown', dismissOnOutsideInteraction);
      document.removeEventListener('focusin', dismissOnOutsideInteraction);
    };
  }, [toasts, removeToast]);

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
          success: 'border-emerald-300/35 text-emerald-50',
          error: 'border-rose-300/35 text-rose-50',
          warning: 'border-amber-200/40 text-amber-50',
          info: 'border-cyan-200/35 text-cyan-50',
        };

        return (
          <div
            key={toast.id}
            id={`toast-message-${toast.id}`}
            data-testid={`toast-message-${toast.id}`}
            className={`pointer-events-auto p-3.5 rounded-xl border bg-gradient-to-br from-[#292650]/90 via-[#26335e]/88 to-[#176b72]/85 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl flex items-start space-x-3 transition-all transform translate-y-0 ${bgColors[toast.type]}`}
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
              data-automation-id="btn-close-toast"
              name={`btn-close-toast-${toast.id}`}
              aria-label="Dismiss Alert Notification"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
