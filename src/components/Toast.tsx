import { useEffect, useRef } from 'react';

export type ToastType = 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const DURATION: Record<ToastType, number> = {
  success: 1500,
  warning: 3000,
  error: 4000,
};

const BG: Record<ToastType, string> = {
  success: 'var(--color-accent)',
  warning: 'var(--color-accent)',
  error: 'var(--color-error)',
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, DURATION[type]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [type, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: BG[type],
        color: '#fff',
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        maxWidth: 320,
        width: 'calc(100% - 48px)',
        zIndex: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {message}
    </div>
  );
}

// Hook to manage toast state — returns show/dismiss + current toast
import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  type: ToastType;
  key: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    counterRef.current += 1;
    setToast({ message, type, key: counterRef.current });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}
