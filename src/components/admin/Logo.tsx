/* Logo del panel (pantalla de login) e ícono (barra lateral). */

const Sol = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    {[0, 45, 90, 135, 180].map((a) => (
      <path key={a} d="M32 2 L37 12 L27 12 Z" fill="#FFD21F" transform={`rotate(${a - 90} 32 40)`} />
    ))}
    <path d="M10 44 A22 22 0 0 1 54 44 Z" fill="#FFC20E" />
    <path d="M6 46 Q32 36 58 46 Q50 56 32 56 Q14 56 6 46 Z" fill="#FFD21F" />
  </svg>
)

export const Logo = () => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/brand/logo-sticker-320.webp" alt="Chévere" width={200} style={{ height: 'auto' }} />
    <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.75 }}>Panel de gestión</div>
  </div>
)

export const Icon = () => <Sol size={28} />
