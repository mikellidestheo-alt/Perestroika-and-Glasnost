import { create } from 'zustand';
import { SCENARIOS } from './scenarios';
import { checkEarlyDefeat, clampMetrics, finalEnding } from './endings';
import type { Ending, Metrics } from './types';

export type Panel = 'none' | 'phone' | 'folder' | 'terminal' | 'paper';

export interface Decision {
  scenarioId: number;
  choice: 'A' | 'B';
}

export interface Headline {
  paper: 'Правда' | 'Известия';
  title: string;
  sub: string;
}

export const INITIAL_METRICS: Metrics = { economy: 55, glasnost: 20, party: 65, trust: 55 };

const INITIAL_HEADLINE: Headline = {
  paper: 'Правда',
  title: 'Пленум ЦК избрал М. С. Горбачёва Генеральным секретарём',
  sub: 'Март 1985 г. Страна ждёт перемен.',
};

interface GameState {
  started: boolean;
  muted: boolean;
  stage: number;
  metrics: Metrics;
  deltas: Partial<Metrics>;
  decisions: Decision[];
  headlines: Headline[];
  panel: Panel;
  phoneAnswered: boolean;
  /** Choice made on the current stage, awaiting acknowledgement. */
  pending: 'A' | 'B' | null;
  pendingEnding: Ending | null;
  ending: Ending | null;

  start: () => void;
  toggleMute: () => void;
  open: (p: Panel) => void;
  close: () => void;
  answerPhone: () => void;
  choose: (c: 'A' | 'B') => void;
  advance: () => void;
  restart: () => void;
}

const fresh = () => ({
  stage: 0,
  metrics: INITIAL_METRICS,
  deltas: {} as Partial<Metrics>,
  decisions: [] as Decision[],
  headlines: [INITIAL_HEADLINE],
  panel: 'none' as Panel,
  phoneAnswered: false,
  pending: null as 'A' | 'B' | null,
  pendingEnding: null as Ending | null,
  ending: null as Ending | null,
});

export const useGame = create<GameState>((set, get) => ({
  started: false,
  muted: false,
  ...fresh(),

  start: () => set({ started: true }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  open: (panel) => set({ panel }),
  close: () => {
    // Closing the folder mid-outcome acknowledges it, so progress is never lost.
    if (get().panel === 'folder' && get().pending) get().advance();
    else set({ panel: 'none' });
  },
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
      headlines: [choice.headline, ...s.headlines],
      pending: c,
      pendingEnding: early ?? (last ? finalEnding(metrics, c) : null),
    });
  },

  advance: () => {
    const s = get();
    if (s.pendingEnding) {
      set({ ending: s.pendingEnding, pendingEnding: null, pending: null, panel: 'none' });
      return;
    }
    set({ stage: s.stage + 1, pending: null, panel: 'none', phoneAnswered: false, deltas: {} });
  },

  restart: () => set({ ...fresh() }),
}));

export const currentScenario = (stage: number) => SCENARIOS[Math.min(stage, SCENARIOS.length - 1)];
