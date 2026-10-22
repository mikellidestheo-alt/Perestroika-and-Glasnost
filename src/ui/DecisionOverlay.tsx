import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { sfx } from '../audio/sfx';
import { SCENARIOS } from '../game/scenarios';
import { useGame } from '../game/store';
import type { ChoiceId } from '../game/types';
import { Overlay } from './Overlay';
import { RichText } from './RichText';

interface Stamped {
  id: ChoiceId;
  x: number;
  y: number;
  rot: number;
  /** viewport position of the slam, for the stamp tool */
  cx: number;
  cy: number;
}

const SLAM_MS = 1300;

/** Briefing plus three policy documents; the player stamps the one they approve. */
export function DecisionOverlay() {
  const stage = useGame((s) => s.stage);
  const choose = useGame((s) => s.choose);
  const setGlossary = useGame((s) => s.setGlossary);
  const scenario = SCENARIOS[stage];
  const [stamped, setStamped] = useState<Stamped | null>(null);
  const [ptr, setPtr] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<number>();

  useEffect(() => sfx.paper(), []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onMove = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') setPtr({ x: e.clientX, y: e.clientY });
  };

  const stamp = (id: ChoiceId, e: ReactMouseEvent<HTMLButtonElement>) => {
    if (stamped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const keyboard = e.detail === 0;
    const cx = keyboard ? rect.left + rect.width / 2 : e.clientX;
    const cy = keyboard ? rect.top + rect.height * 0.72 : e.clientY;
    setStamped({ id, x: cx - rect.left, y: cy - rect.top, rot: Math.round((Math.random() - 0.5) * 18), cx, cy });
    setPtr({ x: cx, y: cy });
    window.setTimeout(() => sfx.stamp(), 180);
    timer.current = window.setTimeout(() => choose(id), SLAM_MS);
  };

  const docs = scenario.order.map((id) => scenario.choices.find((c) => c.id === id)!);

  return (
    <Overlay className="memo decision" closable={!stamped}>
      <button className="gloss-btn" onClick={() => setGlossary(true)}>
        📖 Словарь
      </button>
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

      <h3>{scenario.question}</h3>
      <div className="docs" onPointerMove={onMove} onPointerLeave={() => !stamped && setPtr(null)}>
        {docs.map((c, i) => {
          const isStamped = stamped?.id === c.id;
          return (
            <button
              key={c.id}
              className={`doc ${isStamped ? 'doc-stamped' : ''} ${stamped && !isStamped ? 'doc-dim' : ''}`}
              onClick={(e) => stamp(c.id, e)}
              disabled={!!stamped}
            >
              <span className="doc-head">Проект постановления № {scenario.id}-{i + 1}</span>
              <span className="doc-title">{c.title}</span>
              <span className="doc-text">{c.label}</span>
              <span className="doc-slot">{isStamped ? '' : 'Место для печати'}</span>
              {isStamped && stamped && (
                <span className="imprint" style={{ left: stamped.x, top: stamped.y, ['--rot' as string]: `${stamped.rot}deg` }}>
                  <b>УТВЕРЖДЕНО</b>
                  <i>Генеральный секретарь</i>
                  <i>{scenario.date}</i>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="memo-meta hint-stamp">Выберите документ и поставьте на него печать. Решение необратимо.</p>

      {ptr && (
        <div className={`stamp-tool ${stamped ? 'slam' : ''}`} style={{ left: ptr.x, top: ptr.y }} aria-hidden>
          <div className="st-handle" />
          <div className="st-neck" />
          <div className="st-base" />
        </div>
      )}
    </Overlay>
  );
}
