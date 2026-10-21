import { Suspense } from 'react';
import { Scene } from './scene/Scene';
import { useGame } from './game/store';
import { Hud } from './ui/Hud';
import { Intro } from './ui/Intro';
import { MemoOverlay } from './ui/MemoOverlay';
import { PhoneOverlay } from './ui/PhoneOverlay';
import { NewspaperOverlay } from './ui/NewspaperOverlay';
import { TerminalOverlay } from './ui/TerminalOverlay';
import { EndingScreen } from './ui/EndingScreen';

export function App() {
  const started = useGame((s) => s.started);
  const panel = useGame((s) => s.panel);
  const ending = useGame((s) => s.ending);

  return (
    <div className="app">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <div className="vignette" />
      {!started && <Intro />}
      {started && !ending && <Hud />}
      {started && !ending && panel === 'folder' && <MemoOverlay />}
      {started && !ending && panel === 'phone' && <PhoneOverlay />}
      {started && !ending && panel === 'paper' && <NewspaperOverlay />}
      {started && !ending && panel === 'terminal' && <TerminalOverlay />}
      {ending && <EndingScreen />}
    </div>
  );
}
