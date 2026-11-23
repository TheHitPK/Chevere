export function Stars({ value, size = 16, className = '' }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-naranja ${className}`} role="img" aria-label={`${value.toFixed(1).replace('.0', '')} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i + 1))
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs><linearGradient id={`s${i}-${Math.round(fill * 100)}`}><stop offset={`${fill * 100}%`} stopColor="currentColor" /><stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity=".22" /></linearGradient></defs>
            <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill={`url(#s${i}-${Math.round(fill * 100)})`} />
          </svg>
        )
      })}
    </span>
  )
}
