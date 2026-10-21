import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import { Overlay } from './Overlay';

export function PhoneOverlay() {
  const stage = useGame((s) => s.stage);
  const answerPhone = useGame((s) => s.answerPhone);
  const close = useGame((s) => s.close);
  const scenario = SCENARIOS[stage];

  useEffect(() => sfx.teletype(), []);
  if (!scenario.crisis) return null;

  return (
    <Overlay className="memo phone-memo" closable={false}>
      <div className="stamp urgent">СРОЧНО · ВЕРТУШКА</div>
      <p className="memo-meta">
        {scenario.date} · Звонит: {scenario.crisis.caller}
      </p>
      <h2>Срочное сообщение: {scenario.title}</h2>
      <p className="transcript">«{scenario.crisis.memo}»</p>
      <p className="memo-meta">Папка «Совершенно секретно» с подробной запиской лежит на столе.</p>
      <button
        className="primary"
        onClick={() => {
          answerPhone();
          close();
        }}
      >
        Положить трубку и открыть папку
      </button>
    </Overlay>
  );
}
