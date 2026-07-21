import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  id: string
  index: string
  title: string
  description?: string
}

export function SectionHeading({
  id,
  index,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <header className={styles.heading}>
      <p className={styles.index} aria-hidden="true">
        {index}
      </p>
      <div>
        <h2 className={styles.title} id={id}>
          {title}
        </h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      <span className={styles.node} aria-hidden="true" />
    </header>
  )
}
