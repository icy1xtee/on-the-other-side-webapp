import { createContext } from 'react';
import type { RootStore } from '@/app/stores/RootStore';

export const StoreContext = createContext<RootStore | null>(null);
