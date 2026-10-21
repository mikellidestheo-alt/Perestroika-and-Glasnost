import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { MetricBars } from './MetricBars';
import { RichText } from './RichText';

export function EndingScreen() {
  const ending = useGame((s) => s.ending);
  const decisions = useGame((s) => s.decisions);
  const restart = useGame((s) => s.restart);
  useEffect(() => {
    if (ending) sfx.fanfare(ending.good);
  }, [ending]);
  if (!ending) return null;

  const historicalCount = decisions.filter((d) => SCENARIOS[d.scenarioId - 1].choices.find((c) => c.id === d.choice)?.historical).length;

  return (
    <div className={`overlay ending ${ending.good ? 'good' : 'bad'}`}>
      <div className="sheet ending-sheet">
        <div className="stamp">{ending.good ? 'ИСТОРИЧЕСКОЕ ЗАВЕРШЕНИЕ' : 'ПОРАЖЕНИЕ'}</div>
        <h1>{ending.title}</h1>
        <p className="memo-meta">{ending.subtitle}</p>
        <p>{ending.body}</p>
        <MetricBars />

        <h2>Ваши решения и реальная история</h2>
        <p className="memo-meta">
          Совпадений с историческими решениями: {historicalCount} из {decisions.length}.
        </p>
        <div className="review">
          {decisions.map((d) => {
            const s = SCENARIOS[d.scenarioId - 1];
            const c = s.choices.find((x) => x.id === d.choice)!;
            return (
              <article key={s.id} className={c.historical ? 'match' : 'diff'}>
                <h3>
                  {s.date}: {s.title}
                </h3>
                <p>
                  <b>Ваш выбор ({c.id}):</b> {c.label} <i>{c.historical ? '(как в истории)' : '(альтернатива)'}</i>
                </p>
                <p>
                  <b>История:</b> <RichText text={s.fact} />
                </p>
              </article>
            );
          })}
        </div>
        <button className="primary" onClick={restart}>
          Начать заново
        </button>
      </div>
    </div>
  );
}
