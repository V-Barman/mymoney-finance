import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const Icon = isSuccess
            ? CheckCircle2
            : isError
            ? AlertCircle
            : isWarning
            ? AlertTriangle
            : Info;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`relative overflow-hidden pointer-events-auto p-3.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-center justify-between gap-3 ${
                isSuccess
                  ? 'bg-emerald-950/90 text-white border-emerald-700/60'
                  : isError
                  ? 'bg-rose-950/90 text-white border-rose-700/60'
                  : isWarning
                  ? 'bg-amber-950/90 text-white border-amber-700/60'
                  : 'bg-slate-900/90 text-white border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSuccess
                      ? 'text-emerald-400'
                      : isError
                      ? 'text-rose-400'
                      : isWarning
                      ? 'text-amber-400'
                      : 'text-teal-400'
                  }`}
                />
                <span className="text-xs font-semibold leading-tight line-clamp-2">
                  {toast.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.8, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  isSuccess
                    ? 'bg-emerald-400/70'
                    : isError
                    ? 'bg-rose-400/70'
                    : isWarning
                    ? 'bg-amber-400/70'
                    : 'bg-teal-400/70'
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
