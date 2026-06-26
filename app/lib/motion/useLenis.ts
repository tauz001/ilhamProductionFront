import {useEffect, useRef} from 'react';
import type Lenis from 'lenis';

export function useLenis(paused = false) {
  const instanceRef = useRef<Lenis | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    const instance = instanceRef.current;
    if (!instance) return;

    if (paused || document.visibilityState === 'hidden') instance.stop();
    else instance.start();
  }, [paused]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const finePointer = window.matchMedia('(any-pointer: fine)');
    const desktopViewport = window.matchMedia('(min-width: 1024px)');
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    let disposed = false;
    let loading = false;
    let frameId = 0;

    const shouldEnable = () =>
      finePointer.matches &&
      desktopViewport.matches &&
      !reducedMotion.matches;

    const raf = (time: number) => {
      instanceRef.current?.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    const destroy = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };

    const enable = async () => {
      if (loading || instanceRef.current || !shouldEnable()) return;
      loading = true;

      try {
        const {default: LenisConstructor} = await import('lenis');
        if (disposed || !shouldEnable()) return;

        instanceRef.current = new LenisConstructor({
          lerp: 0.115,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.88,
          autoRaf: false,
          overscroll: true,
          prevent: (node) =>
            Boolean(
              node.closest(
                '[data-native-scroll], [data-lenis-prevent], [role="dialog"]',
              ),
            ),
        });

        if (pausedRef.current || document.visibilityState === 'hidden') {
          instanceRef.current.stop();
        }
        frameId = window.requestAnimationFrame(raf);
      } finally {
        loading = false;
      }
    };

    const sync = () => {
      if (shouldEnable()) void enable();
      else destroy();
    };

    const onVisibilityChange = () => {
      const instance = instanceRef.current;
      if (!instance) return;
      if (document.visibilityState === 'hidden' || pausedRef.current) {
        instance.stop();
      } else {
        instance.start();
      }
    };

    const onRouteScrollTop = () => {
      instanceRef.current?.scrollTo(0, {force: true, immediate: true});
    };

    finePointer.addEventListener('change', sync);
    desktopViewport.addEventListener('change', sync);
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('ilham:route-scroll-top', onRouteScrollTop);
    sync();

    return () => {
      disposed = true;
      finePointer.removeEventListener('change', sync);
      desktopViewport.removeEventListener('change', sync);
      reducedMotion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('ilham:route-scroll-top', onRouteScrollTop);
      destroy();
    };
  }, []);
}

