import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { sfx } from '../audio/sfx';

export function Hud() {
  const stage = useGame((s) => s.stage);
  const flow = useGame((s) => s.flow);
  const answered = useGame((s) => s.phoneAnswered);
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const setGlossary = useGame((s) => s.setGlossary);
  const scenario = SCENARIOS[stage];
  const locked = !!scenario.crisis && !answered;
  const idle = flow === 'idle';

  return (
    <>
      {idle && (
        <div className="hud hud-left">
          <div className="hud-date">{scenario.date}</div>
          <div className="hud-title">
            Этап {stage + 1}/{SCENARIOS.length}: {scenario.title}
          </div>
        </div>
      )}
      <div className="hud hud-right">
        <button className="hud-btn" onClick={() => setGlossary(true)}>
          📖 Словарь
        </button>
        <button
          className="hud-btn"
          onClick={() => {
            toggleMute();
            sfx.setMuted(!muted);
          }}
          aria-label="Звук"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      {idle && (
        <div className="hud hud-bottom">
          {locked ? '☎ Зазвонила «вертушка» – возьмите трубку.' : '📁 Откройте красную папку «Совершенно секретно».'}
        </div>
      )}
    </>
  );
}
