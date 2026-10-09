import { UiStore } from '@/app/stores/UiStore';

/** Owns every store. Stage 2 adds the game and stage stores next to `ui`. */
export class RootStore {
  readonly ui = new UiStore();
}
