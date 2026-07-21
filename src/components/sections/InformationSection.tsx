import type { SiteConfig } from '../../types/site'
import { EventDateRange } from '../EventDateRange/EventDateRange'
import { SectionHeading } from '../SectionHeading/SectionHeading'
import styles from './Sections.module.css'

interface InformationSectionProps {
  event: SiteConfig['event']
}

export function InformationSection({ event }: InformationSectionProps) {
  return (
    <section
      className={styles.section}
      id="information"
      aria-labelledby="information-title"
      tabIndex={-1}
      data-journey-stop
      data-journey-label="開催情報"
    >
      <SectionHeading id="information-title" index="02" title="開催情報" />
      <div className={styles.contentGrid}>
        <dl className={styles.informationList}>
          <div className={styles.informationRow} data-information-kind="date">
            <dt>会期</dt>
            <dd>
              <EventDateRange
                startDate={event.startDate}
                endDate={event.endDate}
              />
            </dd>
          </div>
          <div className={styles.informationRow} data-information-kind="venue">
            <dt>会場</dt>
            <dd>
              <p className={styles.venueName}>{event.venueName}</p>
              <ul className={styles.venueList}>
                {event.venues.map((venue) => (
                  <li key={venue}>{venue}</li>
                ))}
              </ul>
            </dd>
          </div>
          {event.openingHours ? (
            <div className={styles.informationRow} data-information-kind="hours">
              <dt>開場時間</dt>
              <dd>{event.openingHours}</dd>
            </div>
          ) : null}
          <div className={styles.informationRow} data-information-kind="organizer">
            <dt>主催</dt>
            <dd>{event.organizer}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
