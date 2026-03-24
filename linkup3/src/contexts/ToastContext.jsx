import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import clsx from "clsx";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = "info", duration = 3000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast({ message, type: "success", duration }),
    error: (message, duration) => addToast({ message, type: "error", duration }),
    info: (message, duration) => addToast({ message, type: "info", duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ id, message, type, onClose }) {
  const variants = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
    },
  };

  const config = variants[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={clsx(
        "pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-strong min-w-[300px] max-w-md",
        config.bg
      )}
      role="alert"
    >
      <Icon className={clsx("h-5 w-5 flex-shrink-0", config.iconColor)} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium text-neutral-800">{message}</p>
      <button
        onClick={onClose}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4 text-neutral-600" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
