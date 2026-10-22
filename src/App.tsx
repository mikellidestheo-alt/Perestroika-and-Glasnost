import { Suspense } from 'react';
import { Scene } from './scene/Scene';
import { useGame } from './game/store';
import { Hud } from './ui/Hud';
import { Intro } from './ui/Intro';
import { DecisionOverlay } from './ui/DecisionOverlay';
import { PhoneOverlay } from './ui/PhoneOverlay';
import { ArchiveOverlay } from './ui/ArchiveOverlay';
import { TerminalOverlay } from './ui/TerminalOverlay';
import { SkipOverlay } from './ui/SkipOverlay';
import { IssueOverlay } from './ui/IssueOverlay';
import { GlossaryOverlay } from './ui/GlossaryOverlay';
import { EndingScreen } from './ui/EndingScreen';

export function App() {
  const started = useGame((s) => s.started);
  const panel = useGame((s) => s.panel);
  const flow = useGame((s) => s.flow);
  const ending = useGame((s) => s.ending);
  const glossaryOpen = useGame((s) => s.glossaryOpen);
  const playing = started && !ending;

  return (
    <div className="app">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <div className="vignette" />
      {!started && <Intro />}
      {playing && <Hud />}
      {playing && flow === 'idle' && panel === 'folder' && <DecisionOverlay />}
      {playing && flow === 'idle' && panel === 'phone' && <PhoneOverlay />}
      {playing && flow === 'idle' && panel === 'paper' && <ArchiveOverlay />}
      {playing && flow === 'idle' && panel === 'terminal' && <TerminalOverlay />}
      {playing && flow === 'skip' && <SkipOverlay />}
      {playing && flow === 'issue' && <IssueOverlay />}
      {ending && <EndingScreen />}
      {started && glossaryOpen && <GlossaryOverlay />}
    </div>
  );
}
