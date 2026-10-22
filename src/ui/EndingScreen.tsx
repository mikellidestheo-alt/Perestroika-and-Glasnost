import { useEffect, useState } from 'react';
import { sfx } from '../audio/sfx';
import { outlook, REAL_TIMELINE } from '../game/endings';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { MetricBars } from './MetricBars';
import { RichText } from './RichText';

const LEVEL = ['low', 'mid', 'high'] as const;

/** Two screens: first the player's own ending, then what actually happened. */
export function EndingScreen() {
  const ending = useGame((s) => s.ending);
  const decisions = useGame((s) => s.decisions);
  const metrics = useGame((s) => s.metrics);
  const restart = useGame((s) => s.restart);
  const setGlossary = useGame((s) => s.setGlossary);
  const [step, setStep] = useState<0 | 1>(0);

  useEffect(() => {
    if (ending) sfx.fanfare(ending.good);
  }, [ending]);
  if (!ending) return null;

  if (step === 0) {
    const out = outlook(metrics);
    return (
      <div className={`overlay ending ${ending.good ? 'good' : 'bad'}`}>
        <div className="sheet ending-sheet">
          <div className="stamp">{ending.good ? 'ВАША КОНЦОВКА' : 'ВАША КОНЦОВКА · ПОРАЖЕНИЕ'}</div>
          <h1>{ending.title}</h1>
          <p className="memo-meta">{ending.subtitle}</p>
          <p>{ending.body}</p>

          <h2>Какой будет страна через пять лет</h2>
          <MetricBars />
          <p className="forecast">{out.forecast}</p>
          <ul className="outlook">
            {out.lines.map((l) => (
              <li key={l.label} className={`lvl-${LEVEL[l.level]}`}>
                <b>{l.label}.</b> {l.text}
              </li>
            ))}
          </ul>

          <button className="primary" onClick={() => setStep(1)}>
            Далее: как это было на самом деле →
          </button>
        </div>
      </div>
    );
  }

  const matches = decisions.filter((d) => SCENARIOS[d.scenarioId - 1].choices.find((c) => c.id === d.choice)?.historical).length;

  return (
    <div className="overlay ending real">
      <div className="sheet ending-sheet">
        <button className="gloss-btn" onClick={() => setGlossary(true)}>
          📖 Словарь
        </button>
        <div className="stamp">РЕАЛЬНЫЕ СОБЫТИЯ</div>
        <h1>Как это было на самом деле</h1>

        <ol className="timeline">
          {REAL_TIMELINE.map((t) => (
            <li key={t.when}>
              <b>{t.when}.</b> {t.what}
            </li>
          ))}
        </ol>

        <h2>Ваши решения и реальные события</h2>
        <p className="memo-meta">
          Ваши решения совпали с реальными событиями в {matches} случаях из {decisions.length}.
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
                  <b>Ваш выбор:</b> {c.title} – {c.label}
                </p>
                <p className={`real-tag ${c.historical ? 'yes' : 'no'}`}>
                  {c.historical ? '✔ Как произошло на самом деле' : '✘ В реальности было иначе'}
                </p>
                <p>
                  <b>Реальные события:</b> <RichText text={s.fact} />
                </p>
              </article>
            );
          })}
        </div>

        <div className="btn-row">
          <button className="secondary" onClick={() => setStep(0)}>
            ← Моя концовка
          </button>
          <button className="primary" onClick={restart}>
            Начать заново
          </button>
        </div>
      </div>
    </div>
  );
}
