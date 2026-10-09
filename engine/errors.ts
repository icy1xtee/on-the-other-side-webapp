/** Thrown for broken content or misuse of the engine; the message names the scene and step. */
export class EngineError extends Error {
  override name = 'EngineError';
}
