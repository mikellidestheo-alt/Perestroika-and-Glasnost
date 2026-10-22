import { useEffect, useState } from 'react';
import { GLOSSARY_LIST } from '../game/glossary';
import { useGame } from '../game/store';

/** Always-available glossary of key terms (opened from the HUD or any briefing). */
export function GlossaryOverlay() {
  const setGlossary = useGame((s) => s.setGlossary);
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGlossary(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setGlossary]);

  const needle = q.trim().toLowerCase();
  const list = GLOSSARY_LIST.filter((g) => !needle || g.term.includes(needle) || g.ru.toLowerCase().includes(needle) || g.en.toLowerCase().includes(needle));

  return (
    <div className="overlay glossary" onMouseDown={(e) => e.target === e.currentTarget && setGlossary(false)}>
      <div className="sheet gloss-sheet">
        <button className="x" onClick={() => setGlossary(false)} aria-label="Закрыть">
          ×
        </button>
        <h2>Словарь ключевых терминов</h2>
        <input className="gloss-search" placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        <dl className="gloss-list">
          {list.map((g) => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd>
                {g.ru} <em>({g.en})</em>
              </dd>
            </div>
          ))}
          {list.length === 0 && <p className="memo-meta">Ничего не найдено.</p>}
        </dl>
      </div>
    </div>
  );
}
