import { run } from '../interpreter/interpreter';
import type { SceneRegistry } from '../program/sceneRegistry';
import {
  HISTORY_LENGTH,
  shownEntries,
  type Checkpoint,
  type HistoryEntry,
  type Timeline,
} from '../timeline/timeline';
import type { VarValue } from '../types/ids';
import { isRecord, migrate } from './migrate';
import { SAVE_VERSION, saveSchema, type SaveData } from './schema';

export type ParsedSave = { ok: true; save: SaveData } | { ok: false; reason: string };

export type RestoredSave = { ok: true; timeline: Timeline } | { ok: false; reason: string };

/** What a save says about itself rather than about the game: when it was made, after how long. */
export type SaveMeta = {
  /** Milliseconds since the epoch. */
  savedAt: number;
  /** Milliseconds of play so far. */
  playTime: number;
};

/**
 * A save of the game as it stands: the way taken — the line or choice on screen, the way back and
 * forward — and the history. Taken on a line or a choice — Ren'Py: "saving occurs at the start of
 * a statement" — so loading it runs that one statement and nothing before it.
 */
export function createSave(
  timeline: Timeline,
  registry: SceneRegistry,
  { savedAt, playTime }: SaveMeta,
): SaveData {
  const sceneHashes: Record<string, string> = {};
  for (const { state } of timeline.checkpoints) {
    const { sceneId } = state.position;
    sceneHashes[sceneId] ??= registry.getSceneHash(sceneId);
  }
  return {
    version: SAVE_VERSION,
    checkpoints: timeline.checkpoints.map(saveCheckpoint),
    current: timeline.current,
    history: [...timeline.history],
    sceneHashes,
    savedAt,
    playTime,
  };
}

function saveCheckpoint({ state, entries, chosen }: Checkpoint): SaveData['checkpoints'][number] {
  const { position, vars, stage, audio } = state;
  return {
    state: {
      position: { ...position },
      vars: { ...vars },
      stage: {
        background: stage.background,
        sprites: stage.sprites.map((sprite) => ({ ...sprite })),
      },
      audio: { ...audio },
    },
    entries: [...entries],
    ...(chosen === undefined ? {} : { chosen }),
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
 * The way a save resumes from, every checkpoint on a line or a choice and ready for `run()` — or
 * the reason there is nothing to resume.
 *
 * Variables follow Ren'Py's `default`: the story's defaults first, then the saved values, so a
 * variable added since the save gets its default; one removed or retyped since is dropped.
 *
 * A scene edited since the save — another fingerprint, or no line or choice at the saved step —
 * can't be resumed mid-way. The scene on screen starts over with the saved variables, its first
 * line in the history instead of the old one: the player loses one scene at most and never lands
 * in the middle of someone else's line. Rollback stops short of the newest checkpoint in an
 * edited scene, as Ren'Py's stops where the script changed; the way forward, of the oldest.
 */
export function restoreSave(
  save: SaveData,
  registry: SceneRegistry,
  variableDefaults: Readonly<Record<string, VarValue>>,
): RestoredSave {
  const { checkpoints, current, history, sceneHashes } = save;
  const here = checkpoints[current];
  if (!here) {
    return { ok: false, reason: `no checkpoint ${current}, the save has ${checkpoints.length}` };
  }
  const { sceneId } = here.state.position;
  if (!registry.hasScene(sceneId)) {
    return { ok: false, reason: `scene "${sceneId}" is gone` };
  }

  const intact = ({ state }: Checkpoint) => {
    const { position } = state;
    if (
      !registry.hasScene(position.sceneId) ||
      sceneHashes[position.sceneId] !== registry.getSceneHash(position.sceneId)
    ) {
      return false;
    }
    const type = registry.getProgram(position.sceneId)[position.step]?.type;
    return type === 'say' || type === 'choice';
  };
  const restore = (checkpoint: Checkpoint): Checkpoint => ({
    ...checkpoint,
    state: { ...checkpoint.state, vars: mergeVars(variableDefaults, checkpoint.state.vars) },
  });

  const older = checkpoints.slice(0, current);
  const back = older.slice(older.findLastIndex((checkpoint) => !intact(checkpoint)) + 1);

  if (intact(here)) {
    const newer = checkpoints.slice(current + 1);
    const edited = newer.findIndex((checkpoint) => !intact(checkpoint));
    const forward = edited === -1 ? newer : newer.slice(0, edited);
    return {
      ok: true,
      timeline: {
        checkpoints: [...back, here, ...forward].map(restore),
        current: back.length,
        history,
      },
    };
  }

  // The scene on screen was edited: from its start up to its first line, no way forward.
  const start = restore({ ...here, state: { ...here.state, position: { sceneId, step: 0 } } });
  const { state, interaction } = run(start.state, registry);
  if (interaction.type === 'end') {
    return { ok: false, reason: `scene "${sceneId}" has no line left to resume on` };
  }
  const shown = shownEntries(interaction);
  const entries: HistoryEntry[] = [
    ...here.entries.filter((entry) => entry.kind === 'choice'),
    ...shown,
  ];
  const read = history.slice(0, Math.max(0, history.length - here.entries.length));
  return {
    ok: true,
    timeline: {
      checkpoints: [...back.map(restore), { state, entries }],
      current: back.length,
      history: [...read, ...entries].slice(-HISTORY_LENGTH),
    },
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
