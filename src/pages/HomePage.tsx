import { Hero } from '../components/Hero/Hero'
import { ConceptSection } from '../components/sections/ConceptSection'
import { InformationSection } from '../components/sections/InformationSection'
import { WorksPreview } from '../components/Works/WorksPreview'
import { AccessSection } from '../components/sections/AccessSection'
import { siteConfig } from '../config/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './HomePage.module.css'

export function HomePage() {
  useDocumentTitle()

  return (
    <main className={styles.journey} id="main-content" tabIndex={-1}>
      <Hero config={siteConfig} />
      <ConceptSection statement={siteConfig.statement} />
      <InformationSection event={siteConfig.event} />
      <WorksPreview />
      <AccessSection access={siteConfig.access} event={siteConfig.event} />
    </main>
  )
}
