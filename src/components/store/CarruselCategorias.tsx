'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export type FichaCategoria = {
  id: number | string
  href: string
  nombre: string
  /** Clase de efecto propia de la categoría (cat-damas, cat-caballeros…). Vacía en las nuevas. */
  clase: string
  /** Contenido visual de la tarjeta (foto, franja de modelos, etiqueta…), armado en el servidor. */
  cara: ReactNode
}

const PAUSA_MS = 3600

/**
 * Anillo 3D de categorías. Una ficha por cada categoría principal visible: si se agrega otra desde el
 * panel, el anillo se reparte solo entre todas (el radio sale del número de fichas).
 * - Gira de una en una y se detiene al pasar el mouse, al enfocar una ficha con el teclado o al arrastrar.
 * - Con «reducir movimiento» activado no gira solo: queda manual y los cambios son instantáneos.
 * - Un clic en una ficha que no está al frente la trae al frente; un clic en la del frente abre la categoría.
 * - Con menos de 3 categorías no hay anillo posible y se muestra una fila simple.
 */
export function CarruselCategorias({ fichas }: { fichas: FichaCategoria[] }) {
  const n = fichas.length
  const paso = 360 / n
  // Radio relativo al ancho de la ficha: 0.5 / tan(π/n) hace que las fichas se toquen; +0.2 deja aire entre ellas.
  const k = n >= 3 ? +(0.5 / Math.tan(Math.PI / n) + 0.2).toFixed(3) : 0

  const escena = useRef<HTMLDivElement>(null)
  const anillo = useRef<HTMLDivElement>(null)
  const slots = useRef<(HTMLDivElement | null)[]>([])
  const motor = useRef<{ ir: (d: number) => void; aIdx: (i: number) => void } | null>(null)
  const autoRef = useRef(true)
  const [activo, setActivo] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    const el = escena.current
    if (!el || n < 3) return
    const stage: HTMLDivElement = el
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducido) {
      autoRef.current = false
      setAuto(false)
    }
    // Estado de movimiento: ángulo actual (a), ángulo destino (t) y arrastre
    const st = { a: 0, t: null as number | null, drag: false, x0: 0, a0: 0, raf: 0, ult: 0, idx: 0 }
    let hov = false, foco = false, abajo = false, movido = false, evitarClic = false

    function dibujar() {
      anillo.current?.style.setProperty('--a', `${st.a.toFixed(2)}deg`)
      slots.current.forEach((s, i) => {
        if (!s) return
        const cos = Math.cos(((i * paso - st.a) * Math.PI) / 180)
        s.style.opacity = (0.3 + (0.7 * (cos + 1)) / 2).toFixed(2)
        // Las fichas de la parte de atrás no deben interceptar clics
        s.style.pointerEvents = cos > 0.2 ? 'auto' : 'none'
      })
      const idx = ((Math.round(st.a / paso) % n) + n) % n
      if (idx !== st.idx) {
        st.idx = idx
        setActivo(idx)
      }
    }
    function bucle(now: number) {
      const dt = Math.min(now - (st.ult || now), 50)
      st.ult = now
      if (st.t !== null) {
        st.a += (st.t - st.a) * (1 - Math.exp(-dt / 140))
        if (Math.abs(st.t - st.a) < 0.05) {
          st.a = st.t
          st.t = null
        }
      }
      dibujar()
      if (st.t !== null || st.drag) st.raf = requestAnimationFrame(bucle)
      else {
        st.raf = 0
        st.ult = 0
      }
    }
    function mover() {
      if (reducido && st.t !== null) {
        st.a = st.t
        st.t = null
        dibujar()
      } else if (!st.raf) st.raf = requestAnimationFrame(bucle)
    }
    function ir(d: number) {
      st.t = (Math.round((st.t ?? st.a) / paso) + d) * paso
      mover()
    }
    function aIdx(i: number) {
      const base = Math.round((st.t ?? st.a) / paso)
      let d = (((i - base) % n) + n) % n
      if (d > n / 2) d -= n
      st.t = (base + d) * paso
      mover()
    }
    motor.current = { ir, aIdx }
    dibujar()

    const indiceDe = (t: EventTarget | null) => {
      const f = (t as HTMLElement | null)?.closest?.('[data-i]')
      return f ? Number(f.getAttribute('data-i')) : -1
    }
    const alFrente = () => ((Math.round(st.a / paso) % n) + n) % n

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      abajo = true
      movido = false
      st.x0 = e.clientX
      st.a0 = st.a
    }
    const onMove = (e: PointerEvent) => {
      if (!abajo) return
      const dx = e.clientX - st.x0
      if (!movido && Math.abs(dx) > 6) {
        movido = true
        st.drag = true
        st.t = null
        stage.setPointerCapture(e.pointerId)
        stage.style.cursor = 'grabbing'
        mover()
        if (!st.raf) st.raf = requestAnimationFrame(bucle)
      }
      if (movido) st.a = st.a0 - dx * 0.4
    }
    const onUp = () => {
      if (!abajo) return
      abajo = false
      if (movido) {
        st.drag = false
        st.t = Math.round(st.a / paso) * paso
        stage.style.cursor = ''
        evitarClic = true
        window.setTimeout(() => (evitarClic = false), 0)
        mover()
      }
    }
    // Se ejecuta antes que el clic del enlace: si la ficha no está al frente, la trae; si sí, deja pasar.
    const onClic = (e: MouseEvent) => {
      if (evitarClic) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      const i = indiceDe(e.target)
      if (i >= 0 && i !== alFrente()) {
        e.preventDefault()
        e.stopPropagation()
        aIdx(i)
      }
    }
    const onFocusIn = (e: FocusEvent) => {
      foco = true
      const i = indiceDe(e.target)
      if (i >= 0 && i !== alFrente()) aIdx(i)
    }
    const onFocusOut = () => (foco = false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { ir(1); e.preventDefault() }
      if (e.key === 'ArrowLeft') { ir(-1); e.preventDefault() }
    }
    const onEnter = () => (hov = true)
    const onLeave = () => (hov = false)
    const onDrag = (e: Event) => e.preventDefault()

    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('click', onClic, true)
    stage.addEventListener('focusin', onFocusIn)
    stage.addEventListener('focusout', onFocusOut)
    stage.addEventListener('keydown', onKey)
    stage.addEventListener('pointerenter', onEnter)
    stage.addEventListener('pointerleave', onLeave)
    stage.addEventListener('dragstart', onDrag)
    const reloj = window.setInterval(() => {
      if (autoRef.current && !hov && !foco && !st.drag && !document.hidden && st.t === null) ir(1)
    }, PAUSA_MS)

    return () => {
      window.clearInterval(reloj)
      cancelAnimationFrame(st.raf)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('click', onClic, true)
      stage.removeEventListener('focusin', onFocusIn)
      stage.removeEventListener('focusout', onFocusOut)
      stage.removeEventListener('keydown', onKey)
      stage.removeEventListener('pointerenter', onEnter)
      stage.removeEventListener('pointerleave', onLeave)
      stage.removeEventListener('dragstart', onDrag)
      motor.current = null
    }
  }, [n, paso])

  const alternar = () => {
    autoRef.current = !autoRef.current
    setAuto(autoRef.current)
  }

  // Con 1 o 2 categorías no hay anillo: fila simple con las mismas tarjetas.
  if (n < 3) {
    return (
      <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
        {fichas.map((f) => (
          <li key={f.id}>
            <Link href={f.href} className={`cat-card ${f.clase} group relative block aspect-[3/4] overflow-hidden rounded-bloque bg-surface-2`}>
              {f.cara}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  const botonCirculo = 'grid h-11 w-11 place-items-center rounded-full text-xl ring-1 ring-line transition hover:bg-surface-2'

  return (
    <div>
      <div ref={escena} role="group" aria-roledescription="carrusel" aria-label="Colecciones" className="anillo-escena">
        <div ref={anillo} className="anillo" style={{ ['--paso']: `${paso}deg`, ['--k']: k } as CSSProperties}>
          {fichas.map((f, i) => (
            <div key={f.id} ref={(s) => { slots.current[i] = s }} data-i={i} className="anillo-ficha" style={{ ['--i']: i } as CSSProperties}>
              <Link href={f.href} draggable={false} className={`cat-card ${f.clase} group relative block h-full w-full overflow-hidden rounded-bloque bg-surface-2`}>
                {f.cara}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <button type="button" onClick={() => motor.current?.ir(-1)} aria-label="Colección anterior" className={botonCirculo}>←</button>
        <div className="flex items-center">
          {fichas.map((f, i) => (
            <button key={f.id} type="button" onClick={() => motor.current?.aIdx(i)} aria-label={`Ir a ${f.nombre}`} aria-current={i === activo} className="grid h-8 w-6 place-items-center">
              <span className={`block h-2.5 rounded-full transition-all ${i === activo ? 'w-6 bg-magenta-700 dark:bg-sol' : 'w-2.5 bg-line'}`} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => motor.current?.ir(1)} aria-label="Colección siguiente" className={botonCirculo}>→</button>
        <button type="button" onClick={alternar} aria-pressed={!auto} className="ml-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-line transition hover:bg-surface-2">
          {auto ? 'Pausar giro' : 'Girar solo'}
        </button>
      </div>
    </div>
  )
}
