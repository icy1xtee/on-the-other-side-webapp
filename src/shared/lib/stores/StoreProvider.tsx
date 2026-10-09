import type { ReactNode } from 'react';
import type { AppStores } from './AppStores';
import { StoreContext } from './storeContext';

type StoreProviderProps = {
  stores: AppStores;
  children: ReactNode;
};

// The value never changes: stores are mutated, not replaced, so the context never re-renders.
export function StoreProvider({ stores, children }: StoreProviderProps) {
  return <StoreContext value={stores}>{children}</StoreContext>;
}
