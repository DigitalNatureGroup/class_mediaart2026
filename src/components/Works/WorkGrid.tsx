import type { Work } from '../../types/work'
import { WorkItem } from './WorkItem'
import styles from './Works.module.css'

interface WorkGridProps {
  works: readonly Work[]
  variant?: 'preview' | 'full'
}

export function WorkGrid({ works, variant = 'full' }: WorkGridProps) {
  return (
    <ol className={styles.grid} data-grid-variant={variant}>
      {works.map((work, index) => (
        <li key={work.id}>
          <WorkItem work={work} index={index} />
        </li>
      ))}
    </ol>
  )
}
