import { getEventDateRangeParts } from '../../utils/date'
import styles from './EventDateRange.module.css'

interface EventDateRangeProps {
  startDate: string
  endDate: string
}

export function EventDateRange({
  startDate,
  endDate,
}: EventDateRangeProps) {
  const range = getEventDateRangeParts(startDate, endDate)

  return (
    <span className={styles.range}>
      <span className={styles.date}>{range.start}</span>
      {range.end ? (
        <span className={styles.end}>
          <span className={styles.separator}>—</span>
          <span className={styles.date}>{range.end}</span>
        </span>
      ) : null}
    </span>
  )
}
