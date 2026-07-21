import type { SiteConfig } from '../../types/site'
import { SectionHeading } from '../SectionHeading/SectionHeading'
import styles from './Sections.module.css'

interface ConceptSectionProps {
  statement: SiteConfig['statement']
}

const conceptKeywords = /(art|star|星座)/gi

function renderStatement(statement: string) {
  return statement.split(conceptKeywords).map((segment, index) => {
    if (conceptKeywords.test(segment)) {
      conceptKeywords.lastIndex = 0
      return (
        <em className={styles.keyword} key={`${segment}-${index}`}>
          {segment}
        </em>
      )
    }

    conceptKeywords.lastIndex = 0
    return segment
  })
}

export function ConceptSection({ statement }: ConceptSectionProps) {
  return (
    <section
      className={styles.section}
      id="concept"
      aria-labelledby="concept-title"
      tabIndex={-1}
      data-journey-stop
      data-journey-label="コンセプト"
    >
      <SectionHeading id="concept-title" index="01" title="コンセプト" />
      <div className={styles.contentGrid}>
        <p className={styles.statement}>{renderStatement(statement.full)}</p>
      </div>
    </section>
  )
}
