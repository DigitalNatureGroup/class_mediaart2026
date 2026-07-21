import { Link } from 'react-router-dom'
import type { Work } from '../../types/work'
import styles from './WorkDetail.module.css'

interface WorkPaginationProps {
  works: readonly Work[]
  currentSlug: string
}

export function WorkPagination({ works, currentSlug }: WorkPaginationProps) {
  const currentIndex = works.findIndex((work) => work.slug === currentSlug)

  if (currentIndex < 0) {
    return null
  }

  const previous = works[currentIndex - 1]
  const next = works[currentIndex + 1]

  return (
    <nav className={styles.pagination} aria-label="作品間の移動">
      {previous ? (
        <Link
          className={styles.paginationLink}
          to={`/works/${previous.slug}`}
          state={{ routeDirection: 'backward' }}
        >
          <span className={styles.paginationLabel}>前の作品</span>
          <span className={styles.paginationTitle}>{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          className={`${styles.paginationLink} ${styles.paginationNext}`}
          to={`/works/${next.slug}`}
          state={{ routeDirection: 'forward' }}
        >
          <span className={styles.paginationLabel}>次の作品</span>
          <span className={styles.paginationTitle}>{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
