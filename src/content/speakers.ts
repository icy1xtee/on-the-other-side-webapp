/**
 * Who can speak. Not the same list as characters: a voice behind the door speaks without a
 * sprite. Colours for the names come with the design.
 */
export const speakers = {
  mila: { name: 'Мила' },
  stranger: { name: 'Голос за дверью' },
} as const satisfies Record<string, { name: string }>;

export type SpeakerId = keyof typeof speakers;
