import { useContext } from 'react';
import { StoreContext } from '@/app/providers/storeContext';
import type { RootStore } from '@/app/stores/RootStore';

export function useStores(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStores() is called outside of <StoreProvider>');
  }
  return store;
}
