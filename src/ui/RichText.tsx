import { GLOSSARY } from '../game/glossary';

/** Renders text, turning {{term}} markers into hoverable/focusable glossary entries. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\{\{.+?\}\})/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\{\{(.+?)\}\}$/.exec(p);
        if (!m) return <span key={i}>{p}</span>;
        const entry = GLOSSARY[m[1].toLowerCase()];
        if (!entry) return <span key={i}>{m[1]}</span>;
        return (
          <span key={i} className="term" tabIndex={0}>
            {m[1]}
            <span className="term-pop" role="tooltip">
              <b>{entry.term}</b>
              <span>{entry.ru}</span>
              <em>{entry.en}</em>
            </span>
          </span>
        );
      })}
    </>
  );
}
