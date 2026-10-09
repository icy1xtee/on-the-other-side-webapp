export type VarValue = boolean | number | string;

/**
 * The id spaces the engine works with. By default every id is a plain string, so the engine
 * and the app's stores stay free of type parameters. Content narrows them to its own registries
 * (`Command<ContentIds>`), which turns a typo in an id into a compile error.
 */
export type Ids = {
  scene: string;
  background: string;
  character: string;
  emotion: string;
  speaker: string;
  music: string;
  sfx: string;
  vars: Record<string, VarValue>;
};

export type VarName<I extends Ids = Ids> = Extract<keyof I['vars'], string>;
