import { useEffect, type ReactNode } from 'react';
import { useGame } from '../game/store';

export function Overlay({ children, className = '', closable = true }: { children: ReactNode; className?: string; closable?: boolean }) {
  const close = useGame((s) => s.close);
  useEffect(() => {
    if (!closable) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, closable]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closable && close()}>
      <div className={`sheet ${className}`}>
        {closable && (
          <button className="x" onClick={close} aria-label="Закрыть">
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
