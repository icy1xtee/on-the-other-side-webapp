import { useContext } from 'react';
import type { AppStores } from './AppStores';
import { StoreContext } from './storeContext';

export function useStores(): AppStores {
  const stores = useContext(StoreContext);
  if (!stores) {
    throw new Error('useStores() is called outside of <StoreProvider>');
  }
  return stores;
}
