import { create } from 'zustand';
import { SCENARIOS } from './scenarios';
import { checkEarlyDefeat, clampMetrics, finalEnding } from './endings';
import type { ChoiceId, Ending, Issue, Metrics } from './types';

export type Panel = 'none' | 'phone' | 'folder' | 'terminal' | 'paper';

/** idle: playing · skip: time-lapse through the window · issue: the newspaper page after the skip. */
export type Flow = 'idle' | 'skip' | 'issue';

export interface Decision {
  scenarioId: number;
  choice: ChoiceId;
}

export const INITIAL_METRICS: Metrics = { economy: 55, glasnost: 20, party: 65, trust: 55 };

const INITIAL_ISSUE: Issue = {
  scenarioId: null,
  choice: null,
  date: 'Март 1985 г.',
  paper: {
    paper: 'Правда',
    headline: 'Пленум ЦК избрал М. С. Горбачёва Генеральным секретарём',
    sub: 'Страна ждёт перемен.',
    lead: 'Внеочередной пленум ЦК КПСС избрал Генеральным секретарём Михаила Сергеевича Горбачёва. В Москве и республиках новость встречена с осторожными надеждами.',
    reactions: [
      { who: 'Рабочие', text: 'Хочется, чтобы в магазинах стало больше товаров.' },
      { who: 'Интеллигенция', text: 'Он молод и говорит иначе. Посмотрим, что будет дальше.' },
      { who: 'Партаппарат', text: 'Главное – чтобы порядок и стабильность сохранились.' },
    ],
  },
};

interface GameState {
  started: boolean;
  muted: boolean;
  glossaryOpen: boolean;
  stage: number;
  metrics: Metrics;
  deltas: Partial<Metrics>;
  decisions: Decision[];
  issues: Issue[];
  panel: Panel;
  flow: Flow;
  phoneAnswered: boolean;
  /** Choice made on the current stage, awaiting the end of the time skip and newspaper. */
  pending: ChoiceId | null;
  pendingEnding: Ending | null;
  ending: Ending | null;

  start: () => void;
  toggleMute: () => void;
  setGlossary: (open: boolean) => void;
  open: (p: Panel) => void;
  close: () => void;
  answerPhone: () => void;
  choose: (c: ChoiceId) => void;
  finishSkip: () => void;
  advance: () => void;
  restart: () => void;
}

const fresh = () => ({
  stage: 0,
  metrics: INITIAL_METRICS,
  deltas: {} as Partial<Metrics>,
  decisions: [] as Decision[],
  issues: [INITIAL_ISSUE],
  panel: 'none' as Panel,
  flow: 'idle' as Flow,
  phoneAnswered: false,
  pending: null as ChoiceId | null,
  pendingEnding: null as Ending | null,
  ending: null as Ending | null,
});

export const useGame = create<GameState>((set, get) => ({
  started: false,
  muted: false,
  glossaryOpen: false,
  ...fresh(),

  start: () => set({ started: true }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setGlossary: (glossaryOpen) => set({ glossaryOpen }),
  open: (panel) => set({ panel }),
  close: () => set({ panel: 'none' }),
  answerPhone: () => set({ phoneAnswered: true }),

  choose: (c) => {
    const s = get();
    if (s.pending || s.ending) return;
    const scenario = SCENARIOS[s.stage];
    const choice = scenario.choices.find((x) => x.id === c)!;
    const metrics = clampMetrics({
      economy: s.metrics.economy + (choice.effects.economy ?? 0),
      glasnost: s.metrics.glasnost + (choice.effects.glasnost ?? 0),
      party: s.metrics.party + (choice.effects.party ?? 0),
      trust: s.metrics.trust + (choice.effects.trust ?? 0),
    });
    const early = checkEarlyDefeat(metrics);
    const last = s.stage === SCENARIOS.length - 1;
    set({
      metrics,
      deltas: choice.effects,
      decisions: [...s.decisions, { scenarioId: scenario.id, choice: c }],
      issues: [{ scenarioId: scenario.id, choice: c, date: scenario.skipTo.date, paper: choice.paper }, ...s.issues],
      pending: c,
      pendingEnding: early ?? (last ? finalEnding(metrics, c) : null),
      panel: 'none',
      flow: 'skip',
    });
  },

  finishSkip: () => set((s) => (s.flow === 'skip' ? { flow: 'issue' } : s)),

  advance: () => {
    const s = get();
    if (s.pendingEnding) {
      set({ ending: s.pendingEnding, pendingEnding: null, pending: null, panel: 'none', flow: 'idle' });
      return;
    }
    set({ stage: s.stage + 1, pending: null, panel: 'none', flow: 'idle', phoneAnswered: false, deltas: {} });
  },

  restart: () => set({ ...fresh() }),
}));

export const currentScenario = (stage: number) => SCENARIOS[Math.min(stage, SCENARIOS.length - 1)];

/** True when 3D desk objects may be hovered and clicked. */
export const useCanInteract = () => useGame((s) => s.started && !s.ending && s.panel === 'none' && s.flow === 'idle');
