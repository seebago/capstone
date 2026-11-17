import { useEffect, useRef, type RefObject } from 'react';

/**
 * Detecta un deslizamiento horizontal con el dedo (solo eventos táctiles).
 *
 * - `direction`: 'left' (dedo hacia la izquierda) o 'right'.
 * - `edge`: si se indica, el gesto solo cuenta cuando empieza a menos de
 *   `edgeSize` px de ese borde de la pantalla (para no chocar con el scroll
 *   horizontal de los filtros ni con otros gestos).
 * - Se ignora si el gesto empieza sobre un elemento que coincide con `ignoreSelector`
 *   (p. ej. la burbuja del chat, que se arrastra).
 * - El movimiento debe ser mayormente horizontal, así el scroll vertical no lo dispara.
 */
interface SwipeOptions {
  enabled: boolean;
  direction: 'left' | 'right';
  onSwipe: () => void;
  target?: RefObject<HTMLElement | null>; // por defecto, window
  edge?: 'left' | 'right';
  edgeSize?: number;
  minDistance?: number;
  ignoreSelector?: string;
}

export function useHorizontalSwipe({
  enabled,
  direction,
  onSwipe,
  target,
  edge,
  edgeSize = 28,
  minDistance = 60,
  ignoreSelector,
}: SwipeOptions) {
  const cb = useRef(onSwipe);
  cb.current = onSwipe;

  useEffect(() => {
    if (!enabled) return;
    const el: HTMLElement | Window | null = target ? target.current : window;
    if (!el) return;

    let start: { x: number; y: number } | null = null;

    const onStart = (e: Event) => {
      const t = (e as TouchEvent).touches[0];
      if (!t || (e as TouchEvent).touches.length > 1) return;
      if (ignoreSelector && (e.target as Element | null)?.closest?.(ignoreSelector)) return;
      if (edge === 'right' && t.clientX < window.innerWidth - edgeSize) return;
      if (edge === 'left' && t.clientX > edgeSize) return;
      start = { x: t.clientX, y: t.clientY };
    };

    const onEnd = (e: Event) => {
      if (!start) return;
      const t = (e as TouchEvent).changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) < minDistance || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if ((direction === 'left' && dx < 0) || (direction === 'right' && dx > 0)) cb.current();
    };

    const onCancel = () => {
      start = null;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [enabled, direction, target, edge, edgeSize, minDistance, ignoreSelector]);
}
