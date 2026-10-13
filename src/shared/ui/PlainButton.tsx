import type { ComponentProps } from 'react';

/**
 * A button with no look of its own, `type="button"` unless told otherwise — the base the game's
 * buttons are styled from.
 *
 * A mouse click doesn't move focus onto it: otherwise the next Space would press this button
 * again instead of advancing the story. Tab still focuses it for keyboard players.
 */
export function PlainButton({ onMouseDown, type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      {...props}
    />
  );
}
