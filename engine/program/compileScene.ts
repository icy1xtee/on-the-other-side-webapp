import type { Command, StateCommand } from '../types/command';
import type { VarValue } from '../types/ids';
import type { LocalizedText } from '../types/text';

export type CompiledOption = {
  text: LocalizedText;
  when?(vars: Readonly<Record<string, VarValue>>): boolean;
  /** Step where the option's block starts. */
  target: number;
};

/**
 * One step of a compiled scene. Choice blocks are flattened away: like Ren'Py statements with
 * their `next` pointers, every instruction is addressed by a plain index, so a position stays
 * `{ sceneId, step }` however deeply the source nests.
 */
export type Instruction =
  | StateCommand
  | { type: 'jump'; scene: string }
  | { type: 'say'; speaker?: string; text: LocalizedText }
  | { type: 'choice'; options: CompiledOption[] }
  /** Internal: the end of a choice block, continue after the choice. */
  | { type: 'goto'; step: number };

export type Program = readonly Instruction[];

export function compileScene(commands: readonly Command[]): Program {
  const program: Instruction[] = [];
  emitBlock(program, commands);
  return program;
}

function emitBlock(program: Instruction[], commands: readonly Command[]) {
  for (const command of commands) {
    if (command.type === 'choice') {
      emitChoice(program, command);
    } else {
      program.push(command);
    }
  }
}

function emitChoice(program: Instruction[], choice: Extract<Command, { type: 'choice' }>) {
  const options: CompiledOption[] = [];
  program.push({ type: 'choice', options });

  const exits: Array<{ type: 'goto'; step: number }> = [];
  for (const option of choice.options) {
    options.push({ text: option.text, when: option.when, target: program.length });
    emitBlock(program, option.then);

    // A block that ends by leaving the scene never falls through; any other block continues
    // after the choice. Judged by the source, so a nested choice at the end still gets an exit.
    if (option.then.at(-1)?.type !== 'jump') {
      const exit = { type: 'goto' as const, step: -1 };
      exits.push(exit);
      program.push(exit);
    }
  }

  for (const exit of exits) {
    exit.step = program.length;
  }
}
