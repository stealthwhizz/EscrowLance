import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const ToastContext = createContext();

let counter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, variant = "info", duration = 3500) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (duration) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded shadow border text-sm bg-slate-900 border-slate-700 text-slate-100 ${
              t.variant === "success"
                ? "border-emerald-500 text-emerald-100"
                : t.variant === "error"
                ? "border-rose-500 text-rose-100"
                : t.variant === "warning"
                ? "border-amber-500 text-amber-100"
                : ""
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
