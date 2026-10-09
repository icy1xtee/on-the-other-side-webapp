import type { ReactNode } from 'react';
import { StoreContext } from '@/app/providers/storeContext';
import type { RootStore } from '@/app/stores/RootStore';

type StoreProviderProps = {
  store: RootStore;
  children: ReactNode;
};

// The value never changes: stores are mutated, not replaced, so the context never re-renders.
export function StoreProvider({ store, children }: StoreProviderProps) {
  return <StoreContext value={store}>{children}</StoreContext>;
}
