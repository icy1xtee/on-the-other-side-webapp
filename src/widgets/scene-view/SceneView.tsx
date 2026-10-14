import type { SpritePosition, Transition } from '@engine';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { css, keyframes, useTheme, type DefaultTheme } from 'styled-components';
import { StageFrame, type Frame } from '@/entities/frame/ui/Frame';
import { u } from '@/shared/lib/units';
import { useReducedMotion } from '@/shared/lib/useReducedMotion';

type Shown = { key: string; frame: Frame };

/** The story's transition being played: how, and from which frame — null from black. */
type Playing = { kind: Transition; key: number; from: Frame | null };

type SceneViewProps = Frame & {
  /** Skipping, rolling back or forward: frames change at once, as Ren'Py shows no transitions then. */
  instant?: boolean;
  /**
   * The transition the story asked for (`with`), while it plays — a new key plays it; null once
   * it is over or cut short, which leaves the new frame as it is.
   */
  transition?: { kind: Transition; key: number } | null;
  /** The transition under `key` has played to its end. */
  onTransitionEnd?: (key: number) => void;
};

/**
 * The scene — background and characters — with Ren'Py's `dissolve` between frames: the old
 * frame fades out over the new one. The engine already gathers every change up to the next
 * line or choice into one state (in Ren'Py, too, `show` alone draws nothing), so a new
 * background, one character gone and another come are one transition, not three. The first
 * frame fades in from black.
 *
 * A frame may come in with a transition of the story's own instead, Ren'Py's: `fade` — out to
 * black and in to the new frame; `move` — characters that changed places glide there, the rest is
 * there at once; `vpunch` — the new frame shakes up and down. Each tells, when over, that the line
 * may come. For a player who asked for less motion `fade` is a short dissolve, `move` and
 * `vpunch` are none.
 */
export function SceneView({
  background,
  sprites,
  instant = false,
  transition = null,
  onTransitionEnd,
}: SceneViewProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const frame = { background, sprites };
  const key = frameKey(frame);
  const [shown, setShown] = useState<Shown>({ key, frame });
  const [leaving, setLeaving] = useState<Shown | 'black' | null>('black');
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [started, setStarted] = useState<number | null>(null);

  // Set during render, so the new frame never shows for a moment without the old one over it.
  if (transition && transition.key !== started) {
    // The story's transition, from the frame on screen — black, at the very start.
    setStarted(transition.key);
    setPlaying({
      kind: transition.kind,
      key: transition.key,
      from: leaving === 'black' ? null : shown.frame,
    });
    setLeaving(null);
    setShown({ key, frame });
  } else if (playing && transition?.key !== playing.key) {
    // Over, or cut short by a click: the new frame as it is.
    setPlaying(null);
  } else if (key !== shown.key) {
    // A new frame: the one on screen becomes the one dissolving away.
    setLeaving(instant ? null : shown);
    setShown({ key, frame });
  }

  // The transition's time is kept here rather than by its animations: a `move` with nobody
  // moving has none, yet the line waits all the same.
  const latestOnEnd = useRef(onTransitionEnd);
  useLayoutEffect(() => {
    latestOnEnd.current = onTransitionEnd;
  });
  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = window.setTimeout(
      () => latestOnEnd.current?.(playing.key),
      transitionMs(playing.kind, reduced, theme),
    );
    return () => window.clearTimeout(timer);
  }, [playing, reduced, theme]);

  const movedFrom =
    playing?.kind === 'move' && playing.from && !reduced ? positions(playing.from) : undefined;
  return (
    <Scene>
      <Layer $punch={playing?.kind === 'vpunch' && !reduced}>
        <StageFrame frame={shown.frame} movedFrom={movedFrom} />
      </Layer>
      {playing?.kind === 'fade' &&
        (reduced ? (
          <Leaving key={playing.key} $black={!playing.from} $ms={theme.timing.reducedFadeMs}>
            {playing.from && <StageFrame frame={playing.from} />}
          </Leaving>
        ) : (
          <ThroughBlack key={playing.key}>
            {playing.from && (
              <FadingOut>
                <StageFrame frame={playing.from} />
              </FadingOut>
            )}
          </ThroughBlack>
        ))}
      {leaving && (
        <Leaving
          key={leaving === 'black' ? 'black' : leaving.key}
          $black={leaving === 'black'}
          $ms={theme.timing.transitionMs}
          $softened
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) {
              setLeaving(null);
            }
          }}
        >
          {leaving !== 'black' && <StageFrame frame={leaving.frame} />}
        </Leaving>
      )}
    </Scene>
  );
}

/** Two frames are the same picture when the same files stand in the same places. */
function frameKey({ background, sprites }: Frame): string {
  const people = sprites.map(({ tag, src, at }) => `${tag}:${src ?? ''}:${at}`).join(',');
  return `${background ?? ''}|${people}`;
}

/** Where each character stands in a frame, by tag. */
function positions(frame: Frame): Record<string, SpritePosition> {
  return Object.fromEntries(frame.sprites.map(({ tag, at }) => [tag, at]));
}

/** How long the line waits for a transition. */
function transitionMs(kind: Transition, reduced: boolean, { timing }: DefaultTheme): number {
  switch (kind) {
    case 'fade':
      return reduced ? timing.reducedFadeMs : timing.fadeOutMs + timing.fadeInMs;
    case 'move':
      return reduced ? 0 : timing.moveMs;
    case 'vpunch':
      return reduced ? 0 : timing.punchMs;
  }
}

/**
 * Ren'Py's `vpunch` — `Move((0, 10), (0, -10), .10, bounce=True, repeat=True, delay=.275)`: from
 * `punchPx` below to as much above and back, a swing per `punchSwingMs`, stopped after `punchMs`
 * wherever the swing has got to; then the frame is back in place.
 */
function punch({ timing }: DefaultTheme) {
  const { punchMs, punchSwingMs, punchPx } = timing;
  const stops: string[] = [];
  let sign = 1;
  for (let at = 0; at < punchMs; at += punchSwingMs, sign = -sign) {
    stops.push(`${(at / punchMs) * 100}% { transform: translateY(${u(sign * punchPx)}); }`);
  }
  const swung = (punchMs % punchSwingMs) / punchSwingMs;
  const end = -sign * (1 - 2 * swung);
  stops.push(`100% { transform: translateY(${u(end * punchPx)}); }`);
  return keyframes`${stops.join(' ')}`;
}

const dissolve = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

/** Black over the frame until halfway, `fadeOutMs` in, then clearing over `fadeInMs`. */
const blackThenClear = (outPercent: number) => keyframes`
  0%, ${outPercent}% { opacity: 1; }
  100% { opacity: 0; }
`;

const Scene = styled.div`
  position: absolute;
  inset: 0;
`;

const Layer = styled.div<{ $punch?: boolean }>`
  position: absolute;
  inset: 0;
  ${({ $punch, theme }) =>
    $punch &&
    css`
      animation: ${punch(theme)} ${theme.timing.punchMs}ms linear;
    `}
`;

const Leaving = styled(Layer)<{ $black: boolean; $ms: number; $softened?: boolean }>`
  ${({ $black, theme }) =>
    $black &&
    css`
      background: ${theme.colors.stageBackground};
    `}
  pointer-events: none;
  animation: ${dissolve} ${({ $ms }) => $ms}ms ease-in-out forwards;

  /* Still ends — at once — so the old frame is taken away. */
  ${({ $softened }) =>
    $softened &&
    css`
      @media (prefers-reduced-motion: reduce) {
        animation-duration: 1ms;
      }
    `}
`;

/** Ren'Py's `fade`: the old frame goes out to black, then the black clears off the new one. */
const ThroughBlack = styled(Layer)`
  background: ${({ theme }) => theme.colors.letterbox};
  pointer-events: none;
  animation: ${({ theme: { timing } }) =>
    blackThenClear((timing.fadeOutMs / (timing.fadeOutMs + timing.fadeInMs)) * 100)}
    ${({ theme: { timing } }) => timing.fadeOutMs + timing.fadeInMs}ms linear forwards;
`;

const FadingOut = styled(Layer)`
  animation: ${dissolve} ${({ theme }) => theme.timing.fadeOutMs}ms linear forwards;
`;
