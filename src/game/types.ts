export type MetricKey = 'economy' | 'glasnost' | 'party' | 'trust';

export type Metrics = Record<MetricKey, number>;

export const METRIC_LABELS: Record<MetricKey, string> = {
  economy: 'Экономика',
  glasnost: 'Гласность',
  party: 'Поддержка партии',
  trust: 'Народное доверие',
};

export const METRIC_KEYS: MetricKey[] = ['economy', 'glasnost', 'party', 'trust'];

export type ChoiceId = 'A' | 'B' | 'C';

export interface Reaction {
  who: string;
  text: string;
}

/** Newspaper page that appears after the time skip following a decision. */
export interface PaperContent {
  paper: 'Правда' | 'Известия';
  headline: string;
  sub: string;
  /** Main article. May include {{term}} markers resolved against the glossary. */
  lead: string;
  reactions: [Reaction, Reaction, Reaction];
}

export interface Choice {
  id: ChoiceId;
  /** Short policy name printed on the document. */
  title: string;
  label: string;
  historical: boolean;
  effects: Partial<Metrics>;
  paper: PaperContent;
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
  choices: [Choice, Choice, Choice];
  /** Left-to-right order of the three documents on the desk. */
  order: [ChoiceId, ChoiceId, ChoiceId];
  /** Months since January 1985 at the time of this scenario (drives the time-lapse counter). */
  month: number;
  /** Where the time skip after this decision ends. */
  skipTo: { date: string; month: number };
  /** Edexcel-level historical summary shown on the final screen. */
  fact: string;
}

export interface Issue {
  scenarioId: number | null;
  choice: ChoiceId | null;
  date: string;
  paper: PaperContent;
}

export type EndingKind = 'victory' | 'coup' | 'collapse' | 'uprising' | 'force' | 'putsch';

export interface Ending {
  kind: EndingKind;
  title: string;
  subtitle: string;
  body: string;
  good: boolean;
}
