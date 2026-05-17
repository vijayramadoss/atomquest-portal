"use client";
import { create } from "zustand";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}
interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastProvider() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`flex items-center gap-3 p-4 rounded-xl border shadow-xl transition-all sm:w-96 overflow-hidden relative ${toast.type === "error" ? "bg-red-950/90 border-red-900/50 text-red-100" : "bg-card border-border text-foreground"}`}>
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}></div>
          {toast.type === "success" ? <CheckCircle2 className="text-emerald-500 ml-1" size={20} /> : <AlertCircle className="text-red-400 ml-1" size={20} />}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
