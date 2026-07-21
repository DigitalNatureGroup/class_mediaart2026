import type { Work } from '../../types/work'
import styles from './WorkDetail.module.css'

interface WorkMetadataProps {
  work: Work
}

export function WorkMetadata({ work }: WorkMetadataProps) {
  const groups = [
    { label: '使用技術', values: work.technologies },
    { label: '素材', values: work.materials },
    { label: 'メディウム', values: work.media },
    {
      label: '展示場所',
      values: work.exhibitionLocation ? [work.exhibitionLocation] : undefined,
    },
  ].filter((group) => group.values?.length)

  if (groups.length === 0) {
    return null
  }

  return (
    <dl className={styles.metadata}>
      {groups.map((group) => (
        <div className={styles.metadataRow} key={group.label}>
          <dt>{group.label}</dt>
          <dd>{group.values?.join('、')}</dd>
        </div>
      ))}
    </dl>
  )
}
