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
          Вы – Михаил Горбачёв. Страна нуждается в
          <b>перестройке</b>, но партия, армия и КГБ следят за каждым вашим шагом. Пять решений определят судьбу СССР.
        </p>
        <ul className="howto">
          <li>
            <b>Папка</b> на столе – записка и выбор решения.
          </li>
          <li>
            <b>Телефон</b> звонит в кризис: ответьте, прежде чем открыть папку.
          </li>
          <li>
            <b>Терминал</b> – показатели, журнал решений и словарь терминов.
          </li>
          <li>
            <b>Газеты</b> показывают реакцию общества.
          </li>
          <li>Подчёркнутые слова – ключевые термины: наведите курсор или нажмите.</li>
          <li>Мышь: вращение камеры. Звук включён.</li>
        </ul>
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
