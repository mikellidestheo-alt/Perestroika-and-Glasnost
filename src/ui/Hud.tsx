import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { sfx } from '../audio/sfx';

export function Hud() {
  const stage = useGame((s) => s.stage);
  const answered = useGame((s) => s.phoneAnswered);
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const scenario = SCENARIOS[stage];
  const locked = !!scenario.crisis && !answered;

  return (
    <>
      <div className="hud hud-left">
        <div className="hud-date">{scenario.date}</div>
        <div className="hud-title">
          Этап {stage + 1}/{SCENARIOS.length}: {scenario.title}
        </div>
      </div>
      <button
        className="hud hud-right mute"
        onClick={() => {
          toggleMute();
          sfx.setMuted(!muted);
        }}
        aria-label="Звук"
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <div className="hud hud-bottom">
        {locked ? '☎ Зазвонила «вертушка» – возьмите трубку.' : '📁 Откройте красную папку «Совершенно секретно», чтобы принять решение.'}
      </div>
    </>
  );
}
