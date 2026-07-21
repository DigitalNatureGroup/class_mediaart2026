import { Link } from 'react-router-dom'
import type { Work } from '../../types/work'
import { WorkMedia } from './WorkMedia'
import styles from './Works.module.css'

interface WorkItemProps {
  work: Work
  index: number
  showCaption?: boolean
}

export function WorkItem({ work, index, showCaption = true }: WorkItemProps) {
  return (
    <article className={styles.item}>
      <Link
        aria-label={showCaption ? undefined : `作品「${work.title}」の詳細を見る`}
        className={`${styles.itemLink} ${showCaption ? '' : styles.thumbnailLink}`}
        to={`/works/${work.slug}`}
      >
        <WorkMedia
          workId={work.id}
          title={work.title}
          image={work.mainImage}
        />
        {showCaption ? (
          <div className={styles.itemCaption}>
            <span className={styles.itemIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={styles.itemTitle}>{work.title}</h3>
          </div>
        ) : null}
      </Link>
    </article>
  )
}
