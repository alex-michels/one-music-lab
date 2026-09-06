import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * The viewport is an external system: React subscribes to it with
 * useSyncExternalStore instead of copying it into state inside an effect.
 * The server (and hydration) value is `false`, exactly what the previous
 * `undefined` state produced, so the prerendered markup is unchanged.
 */
export const mobileViewport = {
  subscribe: (onChange: () => void) => {
    const mql = window.matchMedia(MOBILE_QUERY);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  },
  getSnapshot: () => window.innerWidth < MOBILE_BREAKPOINT,
  getServerSnapshot: () => false,
};

export function useIsMobile() {
  return React.useSyncExternalStore(
    mobileViewport.subscribe,
    mobileViewport.getSnapshot,
    mobileViewport.getServerSnapshot,
  );
}
