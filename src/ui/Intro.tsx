import { sfx } from '../audio/sfx';
import { useGame } from '../game/store';

export function Intro() {
  const start = useGame((s) => s.start);
  return (
    <div className="overlay intro">
      <div className="sheet intro-sheet">
        <div className="stamp">СОВЕРШЕННО СЕКРЕТНО</div>
        <h1>Кабинет Генерального секретаря</h1>
        <p className="memo-meta">Москва, Кремль · 1985–1991</p>
        <p>
          Вы – Михаил Горбачёв. Страна нуждается в <b>перестройке</b>.
        </p>
        <p>Но помните: каждое ваше решение может очень сильно изменить судьбу Советского Союза.</p>
        <button
          className="primary"
          onClick={() => {
            sfx.unlock();
            sfx.startHum();
            sfx.dial();
            start();
          }}
        >
          Войти в кабинет
        </button>
      </div>
    </div>
  );
}
