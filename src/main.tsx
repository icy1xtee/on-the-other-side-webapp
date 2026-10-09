import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { RootStore } from '@/app/stores/RootStore';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

// Created once, outside React: StrictMode double renders and Fast Refresh don't recreate it.
const rootStore = new RootStore();

createRoot(rootElement).render(
  <StrictMode>
    <App rootStore={rootStore} />
  </StrictMode>,
);
