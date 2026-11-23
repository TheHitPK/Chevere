import { introControl } from '@/lib/scripts'

/**
 * Animación de bienvenida a pantalla completa (solo al entrar al sitio).
 * Se renderiza en el HTML del servidor, así aparece antes de que cargue la página,
 * y un script en línea la maneja sin esperar a React.
 */
export function Intro() {
  return (
    <div id="intro" className="intro" role="dialog" aria-label="Animación de bienvenida de Chévere" suppressHydrationWarning>
      <video
        className="intro-video"
        muted
        playsInline
        preload="auto"
        poster="/intro/intro-poster.webp"
        aria-hidden="true"
        suppressHydrationWarning
      />
      <div className="intro-barra" aria-hidden="true"><span /></div>
      <button type="button" className="intro-saltar">
        Saltar intro <span aria-hidden="true">→</span>
      </button>
      <script dangerouslySetInnerHTML={{ __html: introControl }} />
    </div>
  )
}
