import type { SiteConfig } from '../../types/site'
import { FooterSocials } from './FooterSocials'
import styles from './SiteFooter.module.css'

interface SiteFooterProps {
  config: SiteConfig
}

export function SiteFooter({ config }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.title}>
          {Array.from(config.title).map((letter, index) => (
            <span key={`${letter}-${index}`}>
              {letter}
            </span>
          ))}
        </p>
        <div className={styles.meta}>
          <p>{config.event.organizer}</p>
          {config.credits?.map((credit) => <p key={credit}>{credit}</p>)}
        </div>
        <FooterSocials accounts={config.socialAccounts} />
      </div>
    </footer>
  )
}
