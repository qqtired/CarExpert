import { useEffect } from 'react';
import '../App.css';

export interface ToastProps {
  message: string;
  kind?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, kind = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [onClose, duration]);

  return (
    <div className={`toast toast--${kind}`}>
      <span className="toast__dot" />
      <span className="toast__message">{message}</span>
    </div>
  );
}

