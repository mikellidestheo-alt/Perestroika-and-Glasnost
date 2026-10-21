export type MetricKey = 'economy' | 'glasnost' | 'party' | 'trust';

export type Metrics = Record<MetricKey, number>;

export const METRIC_LABELS: Record<MetricKey, string> = {
  economy: 'Экономика',
  glasnost: 'Гласность',
  party: 'Поддержка партии',
  trust: 'Народное доверие',
};

export const METRIC_KEYS: MetricKey[] = ['economy', 'glasnost', 'party', 'trust'];

export interface Choice {
  id: 'A' | 'B';
  label: string;
  historical: boolean;
  effects: Partial<Metrics>;
  /** Short Russian outcome paragraph shown after the decision. */
  outcome: string;
  /** Headline for «Правда» / «Известия» after this decision. */
  headline: { paper: 'Правда' | 'Известия'; title: string; sub: string };
}

export interface Scenario {
  id: number;
  date: string;
  title: string;
  /** Rings the telephone before the folder unlocks. */
  crisis?: { caller: string; memo: string };
  memoFrom: string;
  /** Text may include {{term}} markers resolved against the glossary. */
  briefing: string[];
  question: string;
  choices: [Choice, Choice];
  /** Edexcel-level historical summary shown on the final screen. */
  fact: string;
}

export type EndingKind = 'victory' | 'coup' | 'collapse' | 'uprising' | 'force' | 'putsch';

export interface Ending {
  kind: EndingKind;
  title: string;
  subtitle: string;
  body: string;
  good: boolean;
}
