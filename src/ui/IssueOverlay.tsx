import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { MetricBars } from './MetricBars';
import { NewspaperPage } from './NewspaperPage';
import { Overlay } from './Overlay';

/** The newspaper that arrives after the time skip and shows how the decision played out. */
export function IssueOverlay() {
  const issue = useGame((s) => s.issues[0]);
  const stage = useGame((s) => s.stage);
  const advance = useGame((s) => s.advance);
  const setGlossary = useGame((s) => s.setGlossary);
  useEffect(() => sfx.paper(), []);

  return (
    <Overlay className="paper issue" closable={false}>
      <NewspaperPage issue={issue} />
      <h3 className="np-voices-title">Как изменилась страна</h3>
      <MetricBars showDeltas />
      <div className="btn-row">
        <button className="primary" onClick={advance}>
          {stage === SCENARIOS.length - 1 ? 'Подвести итоги' : 'К следующему решению →'}
        </button>
        <button className="secondary" onClick={() => setGlossary(true)}>
          📖 Словарь
        </button>
      </div>
    </Overlay>
  );
}
