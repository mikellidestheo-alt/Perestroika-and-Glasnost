import { useEffect, useState } from 'react';
import { sfx } from '../audio/sfx';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { SKIP_MS } from '../scene/windowStates';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

function elapsed(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} ${plural(y, 'год', 'года', 'лет')}`);
  if (m) parts.push(`${m} ${plural(m, 'месяц', 'месяца', 'месяцев')}`);
  return parts.join(' ') || 'меньше месяца';
}

/** Date counter shown while the window plays the time-lapse. */
export function SkipOverlay() {
  const stage = useGame((s) => s.stage);
  const finishSkip = useGame((s) => s.finishSkip);
  const scenario = SCENARIOS[stage];
  const from = scenario.month;
  const to = scenario.skipTo.month;
  const [month, setMonth] = useState(from);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    sfx.startTicking();
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      const p = Math.min(1, (performance.now() - t0) / SKIP_MS);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setMonth(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const done = window.setTimeout(finishSkip, SKIP_MS + 400);
    const skipTimer = window.setTimeout(() => setCanSkip(true), 1800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
      window.clearTimeout(skipTimer);
      sfx.stopTicking();
    };
  }, [from, to, finishSkip]);

  return (
    <div className="skip">
      <div className="skip-date">
        {MONTHS[month % 12]} {1985 + Math.floor(month / 12)} г.
      </div>
      <div className="skip-elapsed">Прошло: {elapsed(Math.max(0, month - from))}</div>
      {canSkip && (
        <button className="skip-btn" onClick={finishSkip}>
          Пропустить ›
        </button>
      )}
    </div>
  );
}
