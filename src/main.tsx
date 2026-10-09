import { createSceneRegistry } from '@engine';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { RootStore } from '@/app/stores/RootStore';
import { scenes, startScene, variableDefaults } from '@/content';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

// The composition root: the story meets the engine here, once, at boot. A broken jump target
// fails right away instead of mid-game. Created outside React, so StrictMode double renders and
// Fast Refresh don't recreate the stores.
const rootStore = new RootStore({
  registry: createSceneRegistry(scenes, startScene),
  variableDefaults,
});

createRoot(rootElement).render(
  <StrictMode>
    <App rootStore={rootStore} />
  </StrictMode>,
);
