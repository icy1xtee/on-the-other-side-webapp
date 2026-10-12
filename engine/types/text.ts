/**
 * A piece of story text, written in the story's source language (Russian). It is also the key
 * of its translation: the app looks it up in i18next, gettext-style, so the engine carries text
 * as it is and never resolves it.
 */
export type LocalizedText = string;
