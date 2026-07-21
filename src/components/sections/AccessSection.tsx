import type { SiteConfig } from '../../types/site'
import { SectionHeading } from '../SectionHeading/SectionHeading'
import sectionStyles from './Sections.module.css'
import styles from './UtilitySections.module.css'

interface AccessSectionProps {
  access: SiteConfig['access']
  event: SiteConfig['event']
}

export function AccessSection({ access, event }: AccessSectionProps) {
  return (
    <section
      className={sectionStyles.section}
      id="access"
      aria-labelledby="access-title"
      tabIndex={-1}
      data-journey-stop
      data-journey-label="アクセス"
    >
      <SectionHeading id="access-title" index="04" title="アクセス" />
      <div className={styles.accessGrid}>
        <div className={styles.accessCopy}>
          <p className={styles.accessSummary}>{access.summary}</p>
          <div className={styles.accessVenue}>
            <p>{event.venueName}</p>
            <p>{event.venues.join('/')}</p>
          </div>
        </div>
        {access.mapEmbedUrl ? (
          <div className={styles.mapFrame}>
            <iframe
              src={access.mapEmbedUrl}
              title={access.mapEmbedTitle ?? '展示会場周辺の地図'}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
