import { useState } from 'react';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { MetricBars } from './MetricBars';
import { Overlay } from './Overlay';

export function TerminalOverlay() {
  const decisions = useGame((s) => s.decisions);
  const stage = useGame((s) => s.stage);
  const [tab, setTab] = useState<'metrics' | 'log'>('metrics');

  return (
    <Overlay className="crt">
      <div className="crt-title">ЭЛЕКТРОНИКА МС-0511 · ГЕНСЕК · ЭТАП {Math.min(stage + 1, 5)}/5</div>
      <div className="tabs">
        <button className={tab === 'metrics' ? 'on' : ''} onClick={() => setTab('metrics')}>
          [ПОКАЗАТЕЛИ]
        </button>
        <button className={tab === 'log' ? 'on' : ''} onClick={() => setTab('log')}>
          [ЖУРНАЛ РЕШЕНИЙ]
        </button>
      </div>

      {tab === 'metrics' && (
        <>
          <MetricBars />
          <p className="crt-note">
            ВНИМАНИЕ: «Поддержка партии» = 0 → путч. «Экономика» = 0 → крах. «Народное доверие» ≤ 20 при «Гласности» ≥ 50 → восстание.
          </p>
        </>
      )}
      {tab === 'log' && (
        <ul className="log">
          {decisions.length === 0 && <li>&gt; РЕШЕНИЙ ПОКА НЕТ</li>}
          {decisions.map((d) => {
            const s = SCENARIOS[d.scenarioId - 1];
            const c = s.choices.find((x) => x.id === d.choice)!;
            return (
              <li key={d.scenarioId}>
                &gt; {s.date}: {s.title} → {c.title}
              </li>
            );
          })}
        </ul>
      )}
    </Overlay>
  );
}
