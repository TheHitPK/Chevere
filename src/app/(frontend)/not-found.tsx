import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <Image src="/brand/logo-sticker-320.webp" alt="Chévere" width={320} height={258} className="h-auto w-40" />
      <p className="mt-4 font-display text-7xl font-extrabold text-magenta-700 dark:text-sol">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">No encontramos esta página</h1>
      <p className="mt-2 text-ink-soft">Puede que el producto ya no esté disponible o que el enlace tenga un error.</p>
      <Link href="/" className="mt-6 rounded-full bg-magenta-700 px-7 py-3.5 font-bold text-white">Volver a la tienda</Link>
    </div>
  )
}
