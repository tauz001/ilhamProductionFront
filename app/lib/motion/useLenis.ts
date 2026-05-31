import {useEffect} from 'react';
import Lenis from 'lenis';

let instance: Lenis | null = null;

export function useLenis() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (instance) return;

    instance = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });

    function raf(time: number) {
      instance?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      instance?.destroy();
      instance = null;
    };
  }, []);
}

