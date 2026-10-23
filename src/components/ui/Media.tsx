import Image from 'next/image'
import type { Image as VeliteImage } from 'velite'
import { showPending } from '@/lib/env'

type Props = {
  image?: { src: VeliteImage; alt: string }
  /** Qué irá aquí, para el recuadro "pendiente" (dev/preview). */
  label: string
  pendingText: string
  /** Texto del fondo neutro en producción cuando no hay imagen (ej. iniciales). */
  fallback: string
  sizes: string
  className?: string
  priority?: boolean
}

// Única regla de imágenes: imagen real, recuadro "pendiente" en dev/preview,
// o fondo neutro con iniciales en producción.
export function Media({ image, label, pendingText, fallback, sizes, className = '', priority }: Props) {
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-card ${className}`}>
        <Image
          src={image.src.src}
          alt={image.alt}
          width={image.src.width}
          height={image.src.height}
          placeholder={image.src.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.src.blurDataURL}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  if (showPending) {
    return (
      <div className={`slot-pending grid place-items-center p-4 text-center text-sm ${className}`}>
        {label} · {pendingText}
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center bg-gradient-to-br from-raised via-card to-bg text-3xl font-semibold tracking-tight text-subtle ${className}`}
    >
      {fallback}
    </div>
  )
}

export function initials(text: string) {
  return text
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}
