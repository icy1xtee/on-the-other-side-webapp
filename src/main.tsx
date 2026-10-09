import { createSceneRegistry } from '@engine';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/styles/fonts';
import App from '@/app/App';
import { RootStore } from '@/app/stores/RootStore';
import { assets, scenes, speakers, startScene, storyEn, variableDefaults } from '@/content';
import { initI18n } from '@/shared/i18n/i18n';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

// The composition root: the story meets the engine and the translations here, once, at boot.
// A broken jump target fails right away instead of mid-game. Created outside React, so
// StrictMode double renders and Fast Refresh don't recreate the stores.
initI18n({ en: storyEn });

const rootStore = new RootStore({
  registry: createSceneRegistry(scenes, startScene),
  variableDefaults,
  presentation: { speakers, assets },
});

createRoot(rootElement).render(
  <StrictMode>
    <App rootStore={rootStore} />
  </StrictMode>,
);
