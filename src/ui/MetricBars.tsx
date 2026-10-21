import { useGame } from '../game/store';
import { METRIC_KEYS, METRIC_LABELS } from '../game/types';

export function MetricBars({ showDeltas = false }: { showDeltas?: boolean }) {
  const metrics = useGame((s) => s.metrics);
  const deltas = useGame((s) => s.deltas);
  return (
    <div className="metrics">
      {METRIC_KEYS.map((k) => {
        const d = deltas[k] ?? 0;
        const low = metrics[k] <= 20;
        return (
          <div key={k} className="metric">
            <div className="metric-head">
              <span>{METRIC_LABELS[k]}</span>
              <span>
                {Math.round(metrics[k])}
                {showDeltas && d !== 0 && <b className={d > 0 ? 'up' : 'down'}> {d > 0 ? `+${d}` : d}</b>}
              </span>
            </div>
            <div className={`bar ${low ? 'bar-low' : ''}`}>
              <i style={{ width: `${metrics[k]}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
