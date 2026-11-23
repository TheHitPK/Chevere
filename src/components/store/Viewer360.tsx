'use client';

/**
 * Viewer360 — Chévere
 * Visor 360° por secuencia de imágenes (36–72 frames) con:
 *  - drag-to-rotate (mouse / touch / pen) con inercia
 *  - auto-rotación de una vuelta al cargar (respeta prefers-reduced-motion)
 *  - botón reproducir / pausar giro
 *  - zoom con Ctrl/⌘ + rueda, pinch en táctil, botones +/− y pan al estar ampliado
 *  - pantalla completa
 *  - teclado: ← → girar · Inicio = frente · + − 0 zoom · Espacio reproducir · F pantalla completa
 *  - precarga progresiva: primero ~12 frames clave, luego el resto (6 en paralelo)
 *  - carga diferida: 'visible' (ficha) o 'interaction' (tarjetas de listado)
 *  - fallback a galería en gama baja / ahorro de datos / si fallan los frames
 * Sin dependencias externas (solo React + Tailwind).
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

type GalleryImage = { src: string; alt: string };

export type Viewer360Props = {
  /** URLs ordenadas del giro, mismo encuadre y fondo. Recomendado: 36 (ligero) o 72 (fluido). */
  frames: string[];
  /** Frame 0 liviano: se pinta de inmediato (cuenta para el LCP) mientras cargan los frames. */
  poster: string;
  /** Fotos complementarias (detalle, modelo, etiqueta). Se usan como galería de respaldo. */
  gallery: GalleryImage[];
  /** Texto alternativo del producto. */
  alt: string;
  /** 'visible': carga al acercarse al viewport (ficha). 'interaction': al primer hover/tap/foco (tarjetas). */
  loadOn?: 'visible' | 'interaction';
  /** Da una vuelta completa al terminar la carga inicial. */
  autoRotate?: boolean;
  /** Segundos por vuelta en modo reproducción. */
  secondsPerTurn?: number;
  /** Píxeles de arrastre por frame (menos = más sensible). */
  dragSensitivity?: number;
  maxZoom?: number;
  /** Relación de aspecto del contenedor (Tailwind). */
  aspectClassName?: string;
  className?: string;
};

type Status = 'idle' | 'loading' | 'ready' | 'fallback';
type AnimMode = 'none' | 'play' | 'inertia';

/* ---------------------------------------------------------------- helpers */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Heurística de gama baja: ahorro de datos, 2G, ≤2 GB RAM o ≤2 núcleos. */
function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData) return true;
  if (nav.connection?.effectiveType && /2g$/.test(nav.connection.effectiveType)) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return true;
  return false;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* ------------------------------------------------------------- componente */

export default function Viewer360({
  frames,
  poster,
  gallery,
  alt,
  loadOn = 'visible',
  autoRotate = true,
  secondsPerTurn = 4,
  dragSensitivity = 8,
  maxZoom = 3,
  aspectClassName = 'aspect-[4/5]',
  className = '',
}: Viewer360Props) {
  const n = frames.length;

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const imgs = useRef<(HTMLImageElement | undefined)[]>([]);
  const frameRef = useRef(0);
  const view = useRef({ zoom: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ acc: 0, lastT: 0, v: 0, pinchDist: 0 });
  const anim = useRef<{ mode: AnimMode; last: number; acc: number; v: number; remaining: number }>({
    mode: 'none', last: 0, acc: 0, v: 0, remaining: Infinity,
  });
  const rafAnim = useRef(0);
  const rafDraw = useRef(0);
  const alive = useRef(true);
  const statusRef = useRef<Status>('idle');

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touched, setTouched] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const setStatusBoth = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  /* ------------------------------------------------------------- dibujo */

  const draw = useCallback(() => {
    rafDraw.current = 0;
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || n === 0) return;
    const i = frameRef.current;
    // Frame pedido o el cargado más cercano (para giro fluido mientras termina la precarga)
    let img = imgs.current[i];
    for (let d = 1; !img && d < n; d++) img = imgs.current[(i + d) % n] ?? imgs.current[(i - d + n) % n];
    if (!img) return;
    const W = c.width, H = c.height;
    const s = Math.min(W / img.naturalWidth, H / img.naturalHeight) * view.current.zoom;
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (W - w) / 2 + view.current.x, (H - h) / 2 + view.current.y, w, h);
  }, [n]);

  const requestDraw = useCallback(() => {
    if (!rafDraw.current) rafDraw.current = requestAnimationFrame(draw);
  }, [draw]);

  const setFrame = (i: number) => {
    frameRef.current = ((i % n) + n) % n;
    const deg = Math.round((frameRef.current / n) * 360);
    const el = sliderRef.current;
    if (el) {
      el.setAttribute('aria-valuenow', String(deg));
      el.setAttribute('aria-valuetext', `Producto girado ${deg} grados`);
    }
    requestDraw();
  };
  const stepFrame = (delta: number) => setFrame(frameRef.current + delta);

  /* --------------------------------------------------------------- zoom */

  const clampPan = () => {
    const c = canvasRef.current;
    if (!c) return;
    const v = view.current;
    const maxX = ((v.zoom - 1) * c.width) / 2;
    const maxY = ((v.zoom - 1) * c.height) / 2;
    v.x = clamp(v.x, -maxX, maxX);
    v.y = clamp(v.y, -maxY, maxY);
  };

  const setZoom = (z: number) => {
    const v = view.current;
    const prev = v.zoom;
    v.zoom = clamp(z, 1, maxZoom);
    // Mantiene el punto central al escalar
    v.x *= v.zoom / prev;
    v.y *= v.zoom / prev;
    if (v.zoom === 1) { v.x = 0; v.y = 0; }
    clampPan();
    setZoomed(v.zoom > 1.01);
    requestDraw();
  };

  /* ---------------------------------------------------------- animación */

  const stop = () => {
    anim.current.mode = 'none';
    cancelAnimationFrame(rafAnim.current);
    setPlaying(false);
  };

  const tick = (t: number) => {
    const a = anim.current;
    const dt = a.last ? Math.min(t - a.last, 64) : 16;
    a.last = t;
    if (a.mode === 'play') {
      a.acc += (dt / 1000) * (n / secondsPerTurn);
      while (a.acc >= 1) {
        a.acc -= 1;
        stepFrame(1);
        a.remaining -= 1;
      }
      if (a.remaining <= 0) return stop();
    } else if (a.mode === 'inertia') {
      a.acc += a.v * dt;
      a.v *= Math.pow(0.93, dt / 16);
      while (Math.abs(a.acc) >= dragSensitivity) {
        const dir = Math.sign(a.acc);
        a.acc -= dir * dragSensitivity;
        stepFrame(-dir);
      }
      if (Math.abs(a.v) < 0.02) return stop();
    } else return;
    rafAnim.current = requestAnimationFrame(tick);
  };

  const startPlay = (turns = Infinity) => {
    if (statusRef.current !== 'ready') return;
    cancelAnimationFrame(rafAnim.current);
    anim.current = { mode: 'play', last: 0, acc: 0, v: 0, remaining: turns * n };
    setPlaying(true);
    rafAnim.current = requestAnimationFrame(tick);
  };

  const startInertia = (v: number) => {
    if (reducedRef.current) return;
    cancelAnimationFrame(rafAnim.current);
    anim.current = { mode: 'inertia', last: 0, acc: 0, v, remaining: Infinity };
    rafAnim.current = requestAnimationFrame(tick);
  };

  /* -------------------------------------------------------------- carga */

  const load = () => {
    if (statusRef.current !== 'idle') return;
    setStatusBoth('loading');
    // ~12 frames clave primero (cada 30°) → el giro es usable enseguida; luego se rellena.
    const step = Math.max(1, Math.round(n / 12));
    const isKey = (i: number) => i % step === 0;
    const order = [...Array(n).keys()].sort((a, b) => Number(!isKey(a)) - Number(!isKey(b)) || a - b);
    const keyTotal = order.filter(isKey).length;
    let cursor = 0, done = 0, failed = 0, keySettled = 0;

    const next = () => {
      if (!alive.current || cursor >= n || statusRef.current === 'fallback') return;
      const idx = order[cursor++];
      const im = new Image();
      im.decoding = 'async';
      im.src = frames[idx];
      im.decode()
        .then(() => {
          imgs.current[idx] = im;
          requestDraw();
        })
        .catch(() => { failed++; })
        .finally(() => {
          if (!alive.current) return;
          done++;
          setProgress(done / n);
          if (failed > n * 0.25) return setStatusBoth('fallback');
          if (isKey(idx) && ++keySettled === keyTotal && statusRef.current === 'loading') {
            setStatusBoth('ready');
            requestDraw();
            if (autoRotate && !reducedRef.current) startPlay(1); // una vuelta de presentación
          }
          next();
        });
    };
    for (let k = 0; k < 6; k++) next();
  };

  /* ------------------------------------------------------------ efectos */

  // Decide fallback al montar
  useEffect(() => {
    alive.current = true;
    if (n < 2 || isLowEndDevice()) setStatusBoth('fallback');
    return () => {
      alive.current = false;
      cancelAnimationFrame(rafAnim.current);
      cancelAnimationFrame(rafDraw.current);
    };
  }, [n]);

  // Carga diferida al entrar en viewport
  useEffect(() => {
    if (loadOn !== 'visible' || !wrapRef.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && (load(), io.disconnect()),
      { rootMargin: '200px' },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOn]);

  // Canvas nítido en pantallas retina; se redimensiona con el contenedor y en fullscreen
  useEffect(() => {
    const el = wrapRef.current, c = canvasRef.current;
    if (!el || !c) return;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(el.clientWidth * dpr);
      c.height = Math.round(el.clientHeight * dpr);
      clampPan();
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, status]);

  // Rueda: solo con Ctrl/⌘ (y pinch de trackpad, que llega como ctrlKey) para no secuestrar el scroll
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    if (statusRef.current !== 'ready' || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setZoom(view.current.zoom * Math.exp(-e.deltaY * 0.0025));
  };
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fn = (e: WheelEvent) => wheelRef.current(e);
    el.addEventListener('wheel', fn, { passive: false });
    return () => el.removeEventListener('wheel', fn);
  }, [status]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  /* ---------------------------------------------------------- handlers */

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    load();
    setTouched(true);
    stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = { acc: 0, lastT: e.timeStamp, v: 0, pinchDist: 0 };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || statusRef.current !== 'ready') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchDist) setZoom(view.current.zoom * (d / g.pinchDist));
      g.pinchDist = d;
      return;
    }

    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (view.current.zoom > 1.01) {
      // Ampliado: arrastrar = desplazar para inspeccionar costuras y texturas
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.current.x += dx * dpr;
      view.current.y += dy * dpr;
      clampPan();
      requestDraw();
      return;
    }
    const dt = Math.max(1, e.timeStamp - g.lastT);
    g.lastT = e.timeStamp;
    g.v = 0.8 * g.v + 0.2 * (dx / dt);
    g.acc += dx;
    while (Math.abs(g.acc) >= dragSensitivity) {
      const dir = Math.sign(g.acc);
      g.acc -= dir * dragSensitivity;
      stepFrame(-dir); // arrastrar a la derecha gira el producto hacia la derecha
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0 && view.current.zoom <= 1.01 && Math.abs(gesture.current.v) > 0.25) {
      startInertia(gesture.current.v);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    load();
    if (statusRef.current !== 'ready') return;
    const handled = () => { e.preventDefault(); setTouched(true); };
    switch (e.key) {
      case 'ArrowRight': handled(); stop(); stepFrame(e.shiftKey ? 4 : 1); break;
      case 'ArrowLeft': handled(); stop(); stepFrame(e.shiftKey ? -4 : -1); break;
      case 'Home': handled(); stop(); setFrame(0); break;
      case '+': case '=': handled(); setZoom(view.current.zoom * 1.25); break;
      case '-': handled(); setZoom(view.current.zoom / 1.25); break;
      case '0': handled(); setZoom(1); break;
      case ' ': case 'Enter': handled(); playing ? stop() : startPlay(); break;
      case 'f': case 'F': handled(); toggleFullscreen(); break;
    }
  };

  /* -------------------------------------------------------------- render */

  if (status === 'fallback') {
    return (
      <Gallery
        images={[{ src: poster, alt }, ...gallery]}
        aspectClassName={aspectClassName}
        className={className}
        onTry360={n >= 2 ? () => { setStatusBoth('idle'); setTimeout(load, 0); } : undefined}
      />
    );
  }

  const ready = status === 'ready';

  return (
    <div
      ref={wrapRef}
      onPointerEnter={loadOn === 'interaction' ? load : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={[
        'group relative isolate w-full select-none overflow-hidden rounded-3xl bg-surface-2 touch-pan-y',
        isFullscreen ? 'h-full rounded-none' : aspectClassName,
        zoomed ? 'cursor-move' : 'cursor-grab active:cursor-grabbing',
        className,
      ].join(' ')}
    >
      {/* Poster inmediato (LCP) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        fetchPriority="high"
        draggable={false}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Control deslizante accesible (teclado y lectores de pantalla). Los botones van fuera de él. */}
      <div
        ref={sliderRef}
        role="slider"
        tabIndex={0}
        aria-roledescription="visor 360°"
        aria-label={`${alt}. Usa las flechas para girar, + y − para ampliar, Espacio para reproducir el giro.`}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={0}
        aria-valuetext="Producto girado 0 grados"
        aria-busy={!ready}
        onKeyDown={onKeyDown}
        onFocus={load}
        className="absolute inset-0 z-[1] rounded-[inherit] outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sol"
      />

      {/* Barra de carga */}
      {status === 'loading' && (
        <div className="absolute inset-x-6 bottom-20 h-1 overflow-hidden rounded-full bg-tinta/10" aria-hidden="true">
          <div className="h-full origin-left bg-gradient-to-r from-sol to-naranja transition-transform duration-200"
               style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}

      {/* Pista de uso */}
      {!touched && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-tinta/75 px-4 py-1.5 text-sm font-medium text-white backdrop-blur motion-safe:animate-pulse">
          ⟲ Arrastra para girar 360°
        </div>
      )}

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
        <div className="flex items-center gap-1 rounded-full bg-white/90 p-1 text-tinta shadow-lg backdrop-blur">
          <CtrlButton label={playing ? 'Pausar giro' : 'Reproducir giro'} disabled={!ready}
                      onClick={() => (playing ? stop() : startPlay())}>
            {playing ? <path d="M7 5h3v14H7zM14 5h3v14h-3z" /> : <path d="M8 5v14l11-7z" />}
          </CtrlButton>
          <CtrlButton label="Alejar" disabled={!ready || !zoomed} onClick={() => setZoom(view.current.zoom / 1.25)}>
            <path d="M5 11h14v2H5z" />
          </CtrlButton>
          <CtrlButton label="Ampliar" disabled={!ready} onClick={() => setZoom(view.current.zoom * 1.25)}>
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
          </CtrlButton>
          <CtrlButton label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} onClick={toggleFullscreen}>
            <path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z" />
          </CtrlButton>
          <CtrlButton label="Ver fotos" onClick={() => { stop(); setStatusBoth('fallback'); }}>
            <path d="M4 5h16v14H4zm2 2v8l4-4 3 3 2-2 3 3V7z" />
          </CtrlButton>
        </div>
      </div>

      <span aria-hidden="true" className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-sol px-2.5 py-1 text-xs font-bold text-tinta">360°</span>
    </div>
  );
}

/* ------------------------------------------------------------ subcomponentes */

function CtrlButton({ label, onClick, disabled, children }: {
  label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full text-tinta transition hover:bg-magenta-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-700 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-tinta"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">{children}</svg>
    </button>
  );
}

/** Galería de respaldo: imagen principal con lupa al pasar el mouse + miniaturas. */
export function Gallery({ images, aspectClassName = 'aspect-[4/5]', className = '', onTry360 }: {
  images: GalleryImage[]; aspectClassName?: string; className?: string; onTry360?: () => void;
}) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState<string | null>(null);
  const img = images[active];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-3xl bg-surface-2 ${aspectClassName}`}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return;
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onPointerLeave={() => setOrigin(null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="h-full w-full object-contain transition-transform duration-200 motion-safe:animate-[fadeIn_.3s_ease]"
          style={origin ? { transform: 'scale(2)', transformOrigin: origin } : undefined}
        />
        {onTry360 && (
          <button type="button" onClick={onTry360}
                  className="absolute right-4 top-4 rounded-full bg-sol px-3 py-1.5 text-xs font-bold text-tinta shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-700">
            Ver en 360°
          </button>
        )}
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
        {images.map((im, i) => (
          <li key={im.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}: ${im.alt}`}
              aria-current={i === active}
              className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-700 ${
                i === active ? 'scale-105 border-magenta-700' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
