import type { Ending, Metrics } from './types';

const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const clampMetrics = (m: Metrics): Metrics => ({
  economy: clamp(m.economy),
  glasnost: clamp(m.glasnost),
  party: clamp(m.party),
  trust: clamp(m.trust),
});

/** Critical trust threshold used for the popular-uprising defeat. */
export const UPRISING_TRUST = 20;
export const UPRISING_GLASNOST = 50;

/** Early-defeat check, run after every decision. */
export function checkEarlyDefeat(m: Metrics): Ending | null {
  if (m.party <= 0) {
    return {
      kind: 'coup',
      good: false,
      title: 'Путч консерваторов',
      subtitle: 'Поддержка партии упала до нуля',
      body: 'Политбюро, КГБ и военные лишают вас власти. Вас объявляют «больным» и отстраняют от руководства; реформы свёрнуты. Именно этого и опасались сторонники перестройки: аппарат партии оставался самой сильной силой в государстве.',
    };
  }
  if (m.economy <= 0) {
    return {
      kind: 'collapse',
      good: false,
      title: 'Полный экономический крах',
      subtitle: 'Экономика упала до нуля',
      body: 'Пустые магазины, талоны на всё, остановка заводов. Централизованная система снабжения перестаёт работать, а регионы начинают сами решать, кому продавать продукцию. Правительство теряет контроль над страной.',
    };
  }
  if (m.trust <= UPRISING_TRUST && m.glasnost >= UPRISING_GLASNOST) {
    return {
      kind: 'uprising',
      good: false,
      title: 'Народное восстание',
      subtitle: 'Народное доверие критически низко при высокой гласности',
      body: 'Свобода слова позволила людям открыто выразить гнев. Забастовки шахтёров, массовые митинги в столицах республик, требования отставки. Власть не может ни подавить, ни успокоить протест.',
    };
  }
  return null;
}

/** Final outcome after the last scenario, if no early defeat happened. */
export function finalEnding(m: Metrics, lastChoice: 'A' | 'B'): Ending {
  if (lastChoice === 'B') {
    return {
      kind: 'force',
      good: false,
      title: 'Чрезвычайное положение',
      subtitle: 'Сила вместо договора',
      body: 'Применение силы вызывает всплеск протеста и международную изоляцию. Республики не подчиняются, а армия колеблется: СССР сохранён лишь на бумаге, и его распад неизбежен.',
    };
  }
  const min = Math.min(m.economy, m.glasnost, m.party, m.trust);
  const avg = (m.economy + m.glasnost + m.party + m.trust) / 4;
  if (min >= 20 && avg >= 40) {
    return {
      kind: 'victory',
      good: true,
      title: 'Август 1991: Союз устоял',
      subtitle: 'Баланс реформ и стабильности достигнут',
      body: 'Вы подписали Союзный договор, сохранив достаточно поддержки в партии, у армии и в обществе. Попытка путча терпит неудачу, а республики остаются в обновлённом Союзе. Историческая справка: в реальности всё закончилось иначе.',
    };
  }
  return {
    kind: 'putsch',
    good: false,
    title: 'Август 1991: ГКЧП',
    subtitle: 'Один из показателей слишком слаб',
    body: 'Договор подписан, но вы потеряли слишком много опор. 19 августа, накануне подписания, ГКЧП объявляет чрезвычайное положение. Путч проваливается за три дня, однако центр потерял авторитет – республики одна за другой провозглашают независимость.',
  };
}
