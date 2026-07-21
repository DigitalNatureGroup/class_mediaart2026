import { Link } from 'react-router-dom'
import { usePublishedWorks } from '../../hooks/usePublishedWorks'
import { SectionHeading } from '../SectionHeading/SectionHeading'
import sectionStyles from '../sections/Sections.module.css'
import { EmptyState } from './EmptyState'
import { WorkMarquee } from './WorkMarquee'
import styles from './Works.module.css'

export function WorksPreview() {
  const state = usePublishedWorks()

  return (
    <section
      className={sectionStyles.section}
      id="works"
      aria-labelledby="works-preview-title"
      tabIndex={-1}
      data-journey-stop
      data-journey-label="作品"
    >
      <SectionHeading
        id="works-preview-title"
        index="03"
        title="作品"
      />
      <div className={styles.previewContent}>
        {state.status === 'loading' ? (
          <EmptyState title="作品を読み込んでいます" />
        ) : null}
        {state.status === 'error' ? (
          <EmptyState title="作品を表示できませんでした" />
        ) : null}
        {state.status === 'success' && state.works.length === 0 ? (
          <EmptyState title="作品情報は準備中です" />
        ) : null}
        {state.status === 'success' && state.works.length > 0 ? (
          <WorkMarquee works={state.works} />
        ) : null}
        <Link className={styles.allWorksLink} to="/works">
          <span>すべての作品を見る</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  )
}
