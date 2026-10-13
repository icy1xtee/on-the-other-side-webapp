import { useEffect, useState } from 'react';

/**
 * The browser's fullscreen, as a setting. Its state is the browser's, not ours: the player can
 * leave with Esc or F11, and the page only follows (`fullscreenchange`). Entering needs a click —
 * the setting's switch is one. It isn't kept between visits: the browser won't open a page in
 * fullscreen without a gesture anyway.
 */
export function useFullscreen(): [boolean, (on: boolean) => void] {
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement !== null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const setFullscreen = (on: boolean) => {
    const request = on ? document.documentElement.requestFullscreen() : document.exitFullscreen();
    // Refused — no gesture, or not allowed in this frame: the switch stays where the browser is.
    request.catch(() => {});
  };

  return [isFullscreen, setFullscreen];
}
