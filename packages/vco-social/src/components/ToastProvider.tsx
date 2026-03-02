import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-10 right-0 left-0 md:left-auto md:right-10 z-[100] flex flex-col gap-2 p-4 md:p-0 pointer-events-none items-center md:items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={twMerge(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl max-w-sm w-full",
                t.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                t.type === 'error' && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                t.type === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-400"
              )}
            >
              {t.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
              {t.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
              {t.type === 'info' && <Info size={18} className="shrink-0" />}
              
              <p className="text-sm font-bold tracking-tight flex-1">{t.message}</p>
              
              <button 
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
