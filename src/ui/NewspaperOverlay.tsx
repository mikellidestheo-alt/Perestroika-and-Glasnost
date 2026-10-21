import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { useGame } from '../game/store';
import { Overlay } from './Overlay';

export function NewspaperOverlay() {
  const headlines = useGame((s) => s.headlines);
  const glasnost = useGame((s) => s.metrics.glasnost);
  useEffect(() => sfx.paper(), []);

  const mood =
    glasnost >= 60
      ? 'Читатели обсуждают острые темы открыто: в газетах – письма, дискуссии, разоблачения.'
      : glasnost >= 30
        ? 'Цензура ослабла, но «неудобные» темы всё ещё обходят стороной.'
        : 'Цензура строга: газеты печатают официальные сообщения.';

  const [top, ...rest] = headlines;
  return (
    <Overlay className="paper">
      <div className="masthead">{top.paper.toUpperCase()}</div>
      <p className="paper-mood">{mood}</p>
      <h2 className="headline">{top.title}</h2>
      <p className="deck">{top.sub}</p>
      {rest.length > 0 && <h3>Архив выпусков</h3>}
      <ul className="archive">
        {rest.map((h, i) => (
          <li key={i}>
            <b>{h.paper}:</b> {h.title}
          </li>
        ))}
      </ul>
    </Overlay>
  );
}
