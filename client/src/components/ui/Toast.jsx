import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const value = React.useMemo(
    () => ({ addToast, success, error, info, removeToast }),
    [addToast, success, error, info, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-sm backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-3',
                t.type === 'success' && 'bg-slate-900/95 border-emerald-500/30 text-emerald-300 shadow-emerald-950/30',
                t.type === 'error' && 'bg-slate-900/95 border-rose-500/30 text-rose-300 shadow-rose-950/30',
                t.type === 'info' && 'bg-slate-900/95 border-blue-500/30 text-blue-300 shadow-blue-950/30'
              )}
            >
              {t.type === 'success' && <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />}
              {t.type === 'error' && <AlertCircle className="size-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />}
              {t.type === 'info' && <Info className="size-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />}
              <div className="flex-1 text-slate-200 text-pretty font-medium">{t.message}</div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export default ToastProvider;
