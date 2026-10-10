import type { SceneRegistry } from '../program/sceneRegistry';
import type { GameState } from '../state/state';
import type { VarValue } from '../types/ids';
import { migrate } from './migrate';
import { SAVE_VERSION, saveSchema, type SaveData } from './schema';

export type ParsedSave = { ok: true; save: SaveData } | { ok: false; reason: string };

/**
 * A save of the game as it stands. Taken on a line or a choice — Ren'Py: "saving occurs at the
 * start of a statement" — so loading it runs that one statement and nothing before it.
 */
export function createSave(state: GameState, registry: SceneRegistry, savedAt: number): SaveData {
  const { position, vars, stage, audio } = state;
  return {
    version: SAVE_VERSION,
    position: { ...position },
    sceneHash: registry.getSceneHash(position.sceneId),
    vars: { ...vars },
    stage: {
      background: stage.background,
      sprites: stage.sprites.map((sprite) => ({ ...sprite })),
    },
    audio: { ...audio },
    savedAt,
  };
}

/**
 * Reads a save slot. Anything but a well-formed save of a known format is refused, with the
 * reason for the log — a broken or foreign value in storage must not break the game.
 */
export function parseSave(text: string): ParsedSave {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'not JSON' };
  }
  if (!isRecord(raw) || typeof raw.version !== 'number') {
    return { ok: false, reason: 'no format version' };
  }

  const migrated = migrate(raw, raw.version);
  if (!migrated.ok) {
    return migrated;
  }
  const parsed = saveSchema.safeParse(migrated.save);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join('.') || 'save'}: ${issue.message}`,
    );
    return { ok: false, reason: issues.join('; ') };
  }
  return { ok: true, save: parsed.data };
}

/**
 * The state a save resumes from, ready for `run()` — or null when its scene is gone.
 *
 * Variables follow Ren'Py's `default`: the story's defaults first, then the saved values, so a
 * variable added since the save gets its default; one removed or retyped since is dropped.
 * If the scene changed under the save — another fingerprint, or no line or choice at the saved
 * step — it starts over with the saved variables: the player loses one scene at most and never
 * lands in the middle of someone else's line.
 */
export function restoreSave(
  save: SaveData,
  registry: SceneRegistry,
  variableDefaults: Readonly<Record<string, VarValue>>,
): GameState | null {
  const { sceneId, step } = save.position;
  if (!registry.hasScene(sceneId)) {
    return null;
  }
  const instruction = registry.getProgram(sceneId)[step];
  const intact =
    save.sceneHash === registry.getSceneHash(sceneId) &&
    (instruction?.type === 'say' || instruction?.type === 'choice');

  return {
    position: { sceneId, step: intact ? step : 0 },
    vars: mergeVars(variableDefaults, save.vars),
    stage: save.stage,
    audio: save.audio,
  };
}

function mergeVars(
  defaults: Readonly<Record<string, VarValue>>,
  saved: Readonly<Record<string, VarValue>>,
): Record<string, VarValue> {
  const vars = { ...defaults };
  for (const [name, value] of Object.entries(saved)) {
    const fallback = defaults[name];
    if (fallback !== undefined && typeof value === typeof fallback) {
      vars[name] = value;
    }
  }
  return vars;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
