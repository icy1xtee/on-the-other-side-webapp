import { EngineError } from '../errors';
import type { Command } from '../types/command';
import { compileScene, type Program } from './compileScene';

export type SceneRegistry = {
  readonly startScene: string;
  getProgram(sceneId: string): Program;
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

  return {
    startScene,
    getProgram(sceneId) {
      const program = programs.get(sceneId);
      if (!program) {
        throw new EngineError(`Scene "${sceneId}" is not registered`);
      }
      return program;
    },
  };
}
