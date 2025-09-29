import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, message, duration: durationMs };
    setToasts((prev) => [...prev, toast]);
    if (durationMs > 0) {
      setTimeout(() => removeToast(id), durationMs);
    }
  }, [removeToast]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'px-4 py-3 rounded-xl shadow-lg min-w-[240px] text-white',
              t.type === 'success' ? 'bg-green-600/90' :
              t.type === 'error' ? 'bg-red-600/90' :
              t.type === 'warning' ? 'bg-yellow-600/90' : 'bg-blue-600/90',
            ].join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
