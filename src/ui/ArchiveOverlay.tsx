import { useEffect, useState } from 'react';
import { sfx } from '../audio/sfx';
import { useGame } from '../game/store';
import { NewspaperPage } from './NewspaperPage';
import { Overlay } from './Overlay';

/** Past issues, opened from the newspapers on the desk. */
export function ArchiveOverlay() {
  const issues = useGame((s) => s.issues);
  const [i, setI] = useState(0);
  useEffect(() => sfx.paper(), []);

  return (
    <Overlay className="paper">
      <div className="archive-nav">
        <button disabled={i >= issues.length - 1} onClick={() => setI(i + 1)}>
          ← Раньше
        </button>
        <span>
          Архив газет · выпуск {issues.length - i} из {issues.length}
        </span>
        <button disabled={i === 0} onClick={() => setI(i - 1)}>
          Позже →
        </button>
      </div>
      <NewspaperPage issue={issues[i]} />
    </Overlay>
  );
}
