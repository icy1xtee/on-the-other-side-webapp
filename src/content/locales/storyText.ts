import type { Command } from '@engine';

/**
 * Every piece of story text a player can see: lines, choice prompts and options (nested blocks
 * included) and speaker names. These are the keys of the story translations.
 */
export function collectStoryText(
  scenes: Readonly<Record<string, readonly Command[]>>,
  speakers: Readonly<Record<string, { name: string }>>,
): Set<string> {
  const texts = new Set<string>(Object.values(speakers).map((speaker) => speaker.name));

  const visit = (commands: readonly Command[]) => {
    for (const command of commands) {
      if (command.type === 'say' && typeof command.text === 'string') {
        texts.add(command.text);
      } else if (command.type === 'choice') {
        if (typeof command.prompt?.text === 'string') {
          texts.add(command.prompt.text);
        }
        for (const option of command.options) {
          if (typeof option.text === 'string') {
            texts.add(option.text);
          }
          visit(option.then);
        }
      }
    }
  };
  Object.values(scenes).forEach(visit);

  return texts;
}
