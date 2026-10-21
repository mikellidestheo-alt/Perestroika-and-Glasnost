import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { MetricBars } from './MetricBars';
import { Overlay } from './Overlay';
import { RichText } from './RichText';

export function MemoOverlay() {
  const stage = useGame((s) => s.stage);
  const pending = useGame((s) => s.pending);
  const choose = useGame((s) => s.choose);
  const advance = useGame((s) => s.advance);
  const scenario = SCENARIOS[stage];
  const chosen = scenario.choices.find((c) => c.id === pending);

  useEffect(() => sfx.paper(), []);

  const decide = (id: 'A' | 'B') => {
    sfx.stamp();
    choose(id);
  };

  return (
    <Overlay className="memo">
      <div className="stamp">СОВЕРШЕННО СЕКРЕТНО</div>
      <p className="memo-meta">
        {scenario.date} · От: {scenario.memoFrom} · Кому: Генеральному секретарю ЦК КПСС
      </p>
      <h2>
        Записка №{scenario.id}: {scenario.title}
      </h2>
      {scenario.briefing.map((p, i) => (
        <p key={i}>
          <RichText text={p} />
        </p>
      ))}

      {!chosen && (
        <>
          <h3>{scenario.question}</h3>
          <div className="choices">
            {scenario.choices.map((c) => (
              <button key={c.id} className="choice" onClick={() => decide(c.id)}>
                <span className="choice-id">{c.id}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {chosen && (
        <div className="outcome">
          <h3>
            Резолюция: вариант {chosen.id}
          </h3>
          <p className="resolution">«{chosen.label}»</p>
          <p>
            <RichText text={chosen.outcome} />
          </p>
          <MetricBars showDeltas />
          <button className="primary" onClick={advance}>
            {stage === SCENARIOS.length - 1 ? 'Подвести итоги' : 'К следующему этапу →'}
          </button>
        </div>
      )}
    </Overlay>
  );
}
