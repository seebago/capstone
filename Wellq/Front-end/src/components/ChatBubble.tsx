import React, { useEffect, useRef, useState } from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';
import type { Exam } from '../types';
import { ChatView } from './ChatView';

/**
 * Chat como burbuja flotante (FAB) arrastrable.
 *
 * - Se puede arrastrar con mouse o dedo a cualquier punto de la pantalla;
 *   la posición se recuerda en este navegador, por separado para móvil y
 *   escritorio (solo preferencia visual). Al cambiar de layout se usa la
 *   posición de ese layout o la esquina inferior derecha del contenido.
 * - Un clic (sin arrastre) abre la ventana de chat; cerrar vuelve al ícono.
 * - La conversación se mantiene montada mientras dure la sesión, así no se
 *   pierde al cerrar y volver a abrir.
 * - El chat sigue 100 % simulado (respuestas sintéticas fijas de ChatView):
 *   este componente no hace ninguna llamada de red.
 */
interface ChatBubbleProps {
  exams: Exam[];
  lang: Language;
}

const FAB_SIZE = 60;
const MARGIN = 12;
const DRAG_THRESHOLD = 6; // px: menos que esto cuenta como clic
const STORAGE_PREFIX = 'wellq-chat-fab-pos:'; // + 'mobile' | 'desktop'
const DESKTOP_QUERY = '(min-width: 1025px)'; // mismo breakpoint que App.css
const MOBILE_NAV_H = 68; // alto de .bottom-nav-container en móvil

type Pos = { x: number; y: number };
type Breakpoint = 'mobile' | 'desktop';

const currentBreakpoint = (): Breakpoint => (window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'mobile');

/** Lee una variable CSS en px definida en App.css (--sidebar-w, --topbar-h). */
function cssPx(name: string, fallback: number): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Zona permitida según el layout: en escritorio no puede quedar sobre la barra
 * lateral; en móvil no puede quedar sobre la barra inferior. Nunca sobre la barra superior.
 */
function clamp(pos: Pos, bp: Breakpoint): Pos {
  const topbar = cssPx('--topbar-h', 70);
  const minX = bp === 'desktop' ? cssPx('--sidebar-w', 220) + MARGIN : MARGIN;
  const minY = topbar + MARGIN;
  const maxX = Math.max(minX, window.innerWidth - FAB_SIZE - MARGIN);
  const bottomReserved = bp === 'mobile' ? MOBILE_NAV_H : 0;
  const maxY = Math.max(minY, window.innerHeight - FAB_SIZE - MARGIN - bottomReserved);
  return {
    x: Math.min(Math.max(minX, pos.x), maxX),
    y: Math.min(Math.max(minY, pos.y), maxY),
  };
}

/** Esquina inferior derecha del área de contenido de cada layout. */
function defaultPos(bp: Breakpoint): Pos {
  const gap = bp === 'desktop' ? 24 : 16;
  const bottomReserved = bp === 'mobile' ? MOBILE_NAV_H : 0;
  return clamp({ x: window.innerWidth - FAB_SIZE - gap, y: window.innerHeight - FAB_SIZE - gap - bottomReserved }, bp);
}

/** Posición guardada por breakpoint (cada layout recuerda la suya). */
function loadPos(bp: Breakpoint): Pos {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + bp);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p?.x === 'number' && typeof p?.y === 'number') return clamp(p, bp);
    }
  } catch {
    // almacenamiento no disponible: se usa la posición por defecto
  }
  return defaultPos(bp);
}

function savePos(pos: Pos, bp: Breakpoint) {
  try {
    localStorage.setItem(STORAGE_PREFIX + bp, JSON.stringify(pos));
  } catch {
    // ignorar
  }
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ exams, lang }) => {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  // ChatView se monta en la primera apertura (así toma los exámenes ya cargados)
  // y después queda montado para no perder la conversación.
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);
  const [bp, setBp] = useState<Breakpoint>(currentBreakpoint);
  const [pos, setPos] = useState<Pos>(() => loadPos(currentBreakpoint()));
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; origin: Pos; moved: boolean } | null>(null);

  // Cambio de breakpoint (redimensionar, rotar): usar la posición propia de ese
  // layout (o la por defecto), no las coordenadas crudas del otro.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      const next = currentBreakpoint();
      setBp(next);
      setPos(loadPos(next));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Dentro del mismo breakpoint, si cambia el tamaño la burbuja no puede quedar fuera de su zona.
  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p, currentBreakpoint()));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Escape cierra la ventana de chat.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, origin: pos, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setDragging(true);
    setPos(clamp({ x: d.origin.x + dx, y: d.origin.y + dy }, bp));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    if (!d) return;
    if (d.moved) {
      setPos((p) => {
        savePos(p, bp);
        return p;
      });
    } else {
      setIsOpen(true);
    }
  };

  // Teclado: Enter/Espacio abren el chat (el botón ya lo hace con click nativo).
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const label = lang === 'en' ? 'Open chat assistant (demo)' : 'Abrir asistente de chat (demo)';

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className={`chat-fab ${dragging ? 'dragging' : ''}`}
          style={{ left: pos.x, top: pos.y }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          aria-label={label}
          title={label}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span className="chat-fab-demo-tag" aria-hidden="true">DEMO</span>
        </button>
      )}

      {/* Ventana: se oculta al cerrar, pero la conversación se conserva. */}
      <div
        className={`chat-floating-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label={t.chatTitle}
        hidden={!isOpen}
      >
        <button
          type="button"
          className="chat-floating-close"
          onClick={() => setIsOpen(false)}
          aria-label={lang === 'en' ? 'Close chat' : 'Cerrar chat'}
          title={lang === 'en' ? 'Close chat' : 'Cerrar chat'}
        >
          ✕
        </button>
        {hasOpened && <ChatView exams={exams} lang={lang} />}
      </div>
    </>
  );
};
