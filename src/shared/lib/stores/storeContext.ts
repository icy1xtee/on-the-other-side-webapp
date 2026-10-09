import { createContext } from 'react';
import type { AppStores } from './AppStores';

export const StoreContext = createContext<AppStores | null>(null);
