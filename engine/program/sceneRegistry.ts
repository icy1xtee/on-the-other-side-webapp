import { EngineError } from '../errors';
import type { Command } from '../types/command';
import { compileScene, type Program } from './compileScene';
import { hashProgram } from './hashProgram';

export type SceneRegistry = {
  readonly startScene: string;
  hasScene(sceneId: string): boolean;
  getProgram(sceneId: string): Program;
  /** The fingerprint of the scene's program: a save made in another version of it won't match. */
  getSceneHash(sceneId: string): string;
};

/**
 * Compiles every scene once and checks the links between them, so a jump to a missing scene
 * fails when the game boots rather than in the middle of a playthrough.
 */
export function createSceneRegistry(
  scenes: Readonly<Record<string, readonly Command[]>>,
  startScene: string,
): SceneRegistry {
  const programs = new Map(
    Object.entries(scenes).map(([sceneId, commands]) => [sceneId, compileScene(commands)]),
  );
  const hashes = new Map(
    [...programs].map(([sceneId, program]) => [sceneId, hashProgram(program)]),
  );

  if (!programs.has(startScene)) {
    throw new EngineError(`Start scene "${startScene}" is not registered`);
  }
  for (const [sceneId, program] of programs) {
    program.forEach((instruction, step) => {
      if (instruction.type === 'jump' && !programs.has(instruction.scene)) {
        throw new EngineError(
          `Scene "${sceneId}", step ${step}: jump to unknown scene "${instruction.scene}"`,
        );
      }
    });
  }

  const known = <T>(map: Map<string, T>, sceneId: string): T => {
    const value = map.get(sceneId);
    if (value === undefined) {
      throw new EngineError(`Scene "${sceneId}" is not registered`);
    }
    return value;
  };

  return {
    startScene,
    hasScene: (sceneId) => programs.has(sceneId),
    getProgram: (sceneId) => known(programs, sceneId),
    getSceneHash: (sceneId) => known(hashes, sceneId),
  };
}
