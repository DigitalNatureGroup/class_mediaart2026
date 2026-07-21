import { useState } from 'react'
import type { WorkImage } from '../../types/work'
import { resolveAssetUrl } from '../../utils/assets'
import styles from './Works.module.css'

interface WorkMediaProps {
  workId: string
  title: string
  image?: WorkImage
  variant?: 'grid' | 'detail' | 'gallery'
}

function placeholderVariant(id: string) {
  const hash = Array.from(id).reduce(
    (current, character) => current + character.charCodeAt(0),
    0,
  )
  return String((hash % 4) + 1)
}

export function WorkMedia({
  workId,
  title,
  image,
  variant = 'grid',
}: WorkMediaProps) {
  const [failedSource, setFailedSource] = useState<string>()
  const hasImageError = image?.src === failedSource

  const className = `${styles.media} ${styles[`media${variant[0].toUpperCase()}${variant.slice(1)}`]}`

  if (image && !hasImageError) {
    return (
      <figure className={className}>
        <img
          className={styles.image}
          src={resolveAssetUrl(image.src)}
          alt={image.alt}
          loading={variant === 'detail' ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSource(image.src)}
        />
        {image.caption ? (
          <figcaption className={styles.caption}>{image.caption}</figcaption>
        ) : null}
      </figure>
    )
  }

  return (
    <div
      className={`${className} ${styles.placeholder}`}
      data-placeholder-variant={placeholderVariant(workId)}
      role="img"
      aria-label={`${title}の作品画像は準備中です`}
    >
      <span className={styles.placeholderIndex} aria-hidden="true">
        {workId.replace(/\D/g, '').slice(-2).padStart(2, '0') || '00'}
      </span>
      <span className={styles.placeholderLine} aria-hidden="true" />
      <span className={styles.placeholderNode} aria-hidden="true" />
    </div>
  )
}
